import { Request, Response } from 'express';
import { prisma } from 'database';

export const createTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { name, description, logoUrl } = req.body;

    if (!name) return res.status(400).json({ error: 'Team name is required' });

    const team = await prisma.team.create({
      data: {
        name,
        description,
        logoUrl,
        members: {
          create: {
            userId,
            role: 'ADMIN'
          }
        }
      }
    });

    res.status(201).json({ team });
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Team name already exists' });
    res.status(500).json({ error: error.message });
  }
};

export const joinTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { teamId } = req.body;

    const existing = await prisma.teamMember.findUnique({
      where: { userId_teamId: { userId, teamId } }
    });

    if (existing) return res.status(400).json({ error: 'Already a member of this team' });

    const member = await prisma.teamMember.create({
      data: {
        userId,
        teamId,
        role: 'MEMBER'
      }
    });

    res.status(200).json({ member });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const leaveTeam = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const { teamId } = req.params;

    await prisma.teamMember.delete({
      where: { userId_teamId: { userId, teamId } }
    });

    res.status(200).json({ message: 'Left team successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const listTeams = async (req: Request, res: Response) => {
  try {
    const teams = await prisma.team.findMany({
      include: {
        _count: {
          select: { members: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ teams });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getLeaderboard = async (req: Request, res: Response) => {
  try {
    // Get all teams and calculate their total gamification points
    // We fetch members and their badges/registrations count to calculate score
    const teams = await prisma.team.findMany({
      include: {
        members: {
          include: {
            user: {
              include: {
                registrations: { where: { status: 'CHECKED_IN' } }
              }
            }
          }
        }
      }
    });

    const leaderboard = teams.map(team => {
      let totalScore = 0;
      team.members.forEach(member => {
        // 50 points per checkin
        totalScore += (member.user.registrations.length * 50);
      });

      return {
        id: team.id,
        name: team.name,
        logoUrl: team.logoUrl,
        memberCount: team.members.length,
        score: totalScore
      };
    }).sort((a, b) => b.score - a.score);

    res.status(200).json({ leaderboard });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyTeams = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.id;
    const myTeams = await prisma.teamMember.findMany({
      where: { userId },
      include: {
        team: {
          include: {
            _count: { select: { members: true } }
          }
        }
      }
    });

    res.status(200).json({ teams: myTeams.map(t => t.team) });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
