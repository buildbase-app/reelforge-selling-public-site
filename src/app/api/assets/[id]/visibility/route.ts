import { NextRequest, NextResponse } from 'next/server';
import { adminFetch } from '@/lib/buildbase-admin';
import {
  adminErrorResponse,
  requireSessionAndAdmin,
} from '../../../modules-shared';

/** PATCH /api/assets/:id/visibility { public: boolean } */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const gate = await requireSessionAndAdmin();
  if (!gate.ok) return gate.response;
  const { id } = await params;
  const body = (await request.json().catch(() => ({}))) as { public?: boolean };
  const makePublic = body.public === true;
  try {
    const updated = await adminFetch<unknown>(
      `assets/${id}/${makePublic ? 'public' : 'private'}`,
      { method: 'PATCH' }
    );
    return NextResponse.json({ asset: updated });
  } catch (error) {
    return adminErrorResponse(error);
  }
}
