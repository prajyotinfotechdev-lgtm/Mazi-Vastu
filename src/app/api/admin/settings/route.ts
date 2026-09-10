import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { auth } from '@/lib/auth/config';

export async function GET() {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Try to find the default settings
    let settings = await prisma.siteSettings.findFirst();

    if (!settings) {
      // Create default if none exists
      settings = await prisma.siteSettings.create({
        data: {
          founderName: 'Kishor Lavte',
          officeAddress: 'Pune, Maharashtra',
          phone: '+91 98765 43210',
          email: 'contact@mazivastu.com',
          disclosure: 'All properties are subject to prior sale, change, or withdrawal. Neither broker(s) nor information provider(s) shall be responsible for any typographical errors, misinformation, or misprints and shall be held totally harmless. Information is provided for consumers\' personal, non-commercial use and may not be used for any purpose other than to identify prospective properties consumers may be interested in purchasing.',
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error fetching site settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await auth();
    if (!session || !session.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    let settings = await prisma.siteSettings.findFirst();

    if (settings) {
      settings = await prisma.siteSettings.update({
        where: { id: settings.id },
        data: {
          founderName: data.founderName,
          founderImage: data.founderImage,
          officeAddress: data.officeAddress,
          phone: data.phone,
          email: data.email,
          disclosure: data.disclosure,
          instagramUrl: data.instagramUrl,
          facebookUrl: data.facebookUrl,
          youtubeUrl: data.youtubeUrl,
          whatsappUrl: data.whatsappUrl,
          linkedinUrl: data.linkedinUrl,
          telegramUrl: data.telegramUrl,
        }
      });
    } else {
      settings = await prisma.siteSettings.create({
        data: {
          founderName: data.founderName || 'Kishor Lavte',
          founderImage: data.founderImage,
          officeAddress: data.officeAddress,
          phone: data.phone,
          email: data.email,
          disclosure: data.disclosure,
          instagramUrl: data.instagramUrl,
          facebookUrl: data.facebookUrl,
          youtubeUrl: data.youtubeUrl,
          whatsappUrl: data.whatsappUrl,
          linkedinUrl: data.linkedinUrl,
          telegramUrl: data.telegramUrl,
        }
      });
    }

    return NextResponse.json({ settings });
  } catch (error: any) {
    console.error('Error updating site settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
