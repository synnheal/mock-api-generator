'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProjectStore } from '@/stores/project-store';

const examples = {
  ecommerce: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'E-commerce API',
    $defs: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          email: { type: 'string', format: 'email' },
          name: { type: 'string' },
          role: { type: 'string', enum: ['customer', 'admin'] },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['email', 'name'],
      },
      Product: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          description: { type: 'string' },
          price: { type: 'number', minimum: 0 },
          stock: { type: 'integer', minimum: 0 },
          category: { type: 'string' },
          imageUrl: { type: 'string', format: 'uri' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['name', 'price'],
      },
      Order: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          userId: { type: 'string', format: 'uuid' },
          status: { type: 'string', enum: ['pending', 'confirmed', 'shipped', 'delivered'] },
          total: { type: 'number', minimum: 0 },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['userId', 'status', 'total'],
      },
    },
  },
  blog: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Blog API',
    $defs: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          email: { type: 'string', format: 'email' },
          bio: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['username', 'email'],
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          title: { type: 'string' },
          content: { type: 'string' },
          authorId: { type: 'string', format: 'uuid' },
          published: { type: 'boolean' },
          tags: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['title', 'content', 'authorId'],
      },
      Comment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          postId: { type: 'string', format: 'uuid' },
          authorId: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['postId', 'authorId', 'content'],
      },
    },
  },
  social: {
    $schema: 'http://json-schema.org/draft-07/schema#',
    title: 'Social Network API',
    $defs: {
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          username: { type: 'string' },
          displayName: { type: 'string' },
          email: { type: 'string', format: 'email' },
          bio: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri' },
          followersCount: { type: 'integer', minimum: 0 },
          followingCount: { type: 'integer', minimum: 0 },
          verified: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['username', 'email'],
      },
      Post: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          authorId: { type: 'string', format: 'uuid' },
          content: { type: 'string' },
          mediaUrls: { type: 'array', items: { type: 'string', format: 'uri' } },
          likesCount: { type: 'integer', minimum: 0 },
          commentsCount: { type: 'integer', minimum: 0 },
          repostsCount: { type: 'integer', minimum: 0 },
          createdAt: { type: 'string', format: 'date-time' },
        },
        required: ['authorId', 'content'],
      },
    },
  },
};

export function SchemaExamples() {
  const t = useTranslations('presets');
  const { setSchemaText, parseAndValidateSchema } = useProjectStore();

  const loadExample = (key: keyof typeof examples) => {
    const schema = examples[key];
    setSchemaText(JSON.stringify(schema, null, 2));
    setTimeout(() => parseAndValidateSchema(), 100);
  };

  return (
    <div className="space-y-3 p-3">
      <h3 className="font-semibold">{t('title')}</h3>
      <div className="grid gap-3">
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => loadExample('ecommerce')}>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">{t('ecommerce')}</CardTitle>
            <CardDescription className="text-xs">User, Product, Order</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => loadExample('blog')}>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">{t('blog')}</CardTitle>
            <CardDescription className="text-xs">User, Post, Comment</CardDescription>
          </CardHeader>
        </Card>
        <Card className="cursor-pointer hover:bg-muted/50" onClick={() => loadExample('social')}>
          <CardHeader className="p-3">
            <CardTitle className="text-sm">{t('social')}</CardTitle>
            <CardDescription className="text-xs">User, Post</CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
