import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../lib/mongoose';
import { Faq } from '../../../lib/models';
import { requireAdmin, verifySession } from '../../../lib/auth';
import { getPublicFaqs, invalidate, CACHE_TAGS } from '../../../lib/cache';

export async function GET(req) {
  const session = verifySession(req);

  // Public storefront path — served from the tag-invalidated Data Cache.
  if (!session) {
    const publicFaqs = await getPublicFaqs();
    return NextResponse.json(publicFaqs);
  }

  await connectToDatabase();
  const faqs = await Faq.find().lean();
  return NextResponse.json(faqs);
}

export async function POST(req) {
  await connectToDatabase();
  const auth = requireAdmin(req);
  if (auth.response) return auth.response;

  let body = await req.json().catch(() => ({}));
  
  const q = (body.question || '').trim();
  const a = (body.answer || '').trim();
  if (!q || !a) return NextResponse.json({ error: 'Question and answer are required.' }, { status: 400 });

  const faqsCount = await Faq.countDocuments();

  const faq = {
    id: `faq_${Date.now()}`,
    question: q,
    answer: a,
    category: body.category || 'ordering',
    order: typeof body.order === 'number' ? body.order : faqsCount + 1,
    enabled: body.enabled !== false,
    showOnHomepage: !!body.showOnHomepage,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  await Faq.create(faq);
  invalidate([CACHE_TAGS.faqs]);
  return NextResponse.json(faq, { status: 201 });
}

export async function PATCH(req) {
  await connectToDatabase();
  const auth = requireAdmin(req);
  if (auth.response) return auth.response;

  let body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  const existing = await Faq.findOne({ id }).lean();
  if (!existing) return NextResponse.json({ error: 'FAQ not found' }, { status: 404 });

  const patch = { updatedAt: Date.now() };
  if (body.question !== undefined) patch.question = String(body.question).trim();
  if (body.answer !== undefined) patch.answer = String(body.answer).trim();
  if (body.category !== undefined) patch.category = String(body.category);
  if (body.order !== undefined) patch.order = Number(body.order) || 0;
  if (body.enabled !== undefined) patch.enabled = !!body.enabled;
  if (body.showOnHomepage !== undefined) patch.showOnHomepage = !!body.showOnHomepage;

  const updated = await Faq.findOneAndUpdate({ id }, { $set: patch }, { new: true, lean: true });
  invalidate([CACHE_TAGS.faqs]);
  return NextResponse.json(updated);
}

export async function DELETE(req) {
  await connectToDatabase();
  const auth = requireAdmin(req);
  if (auth.response) return auth.response;

  let body = await req.json().catch(() => ({}));
  const { id } = body;
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

  await Faq.findOneAndDelete({ id });
  invalidate([CACHE_TAGS.faqs]);
  return NextResponse.json({ ok: true });
}
