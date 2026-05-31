Session 1 prompt:
I need to build the articles infrastructure for this Next.js site. Read CLAUDE.md first to understand the project conventions, then read the existing patterns I'm modeling on.
Existing pieces (already built — don't change these):

ArticleMeta type in types/index.ts
getAllArticles and getArticle functions in lib/content.ts
ArticleLayout component in components/
content/articles/ folder
app/things-to-do/page.tsx — a one-off article route I want to keep as-is (don't touch)

What I want built:

app/articles/[slug]/page.tsx — dynamic route that renders any article in content/articles/. Should follow the same patterns as app/events/[slug]/page.tsx (generateStaticParams, generateMetadata, JSON-LD schema for Article type). Use getArticle(slug) and render through ArticleLayout.
app/articles/page.tsx — hub page listing all articles. Use getAllArticles(). Model it on app/events/page.tsx structure but simpler — no Google Calendar integration, just articles. Grid of article cards similar to the event cards (image + title + summary + link).
Add "Articles" to the header nav in components/layout/Header.tsx. Insert it in a position that makes sense alongside Events, Downtown, Things to Do, Businesses, About.

Before writing code:

Read app/events/[slug]/page.tsx and app/events/page.tsx to understand my existing patterns (info strip, schema, breadcrumb, CTA).
Check types/index.ts to see what's in ArticleMeta — if anything's missing for the hub page (like an excerpt or hero image), tell me what to add before you write it.
Check lib/content.ts to confirm getAllArticles signature and what it returns.
Check components/layout/Header.tsx to see how nav links are currently structured.

Then propose the plan in prose — what you'll create, what types changes (if any) are needed, what nav position you'll use. Wait for my confirmation before writing files.
After I confirm, build:

Create app/articles/page.tsx and app/articles/[slug]/page.tsx
Update components/layout/Header.tsx
Don't touch app/things-to-do/page.tsx
Don't write any actual article content yet — just the infrastructure

For testing, create a placeholder MD at content/articles/test-article.md with simple frontmatter and a paragraph of lorem ipsum so we can verify the routes work. I'll delete it later.
Don't deploy — I'll review the diffs in the Source Control panel, run npm run dev myself, and commit when I'm satisfied.

Why this prompt works
A few things I intentionally built in:

It tells Claude Code to read the existing patterns first rather than guessing. The events route already does almost exactly what an article route needs, so modeling on it produces consistent code.
It enforces your "propose the plan first" rule explicitly — Claude Code will respect this from CLAUDE.md too, but stating it in the prompt is extra insurance.
It separates infrastructure from content so session 1 is small and bounded. No risk of Claude Code writing 1,500 words of coffee content you didn't ask for.
The placeholder MD strategy lets you verify the routes work without writing real content yet.
"Don't deploy" keeps you in control. You review diffs, you run dev, you commit.

Likely back-and-forth before the build
When Claude Code reads the existing files, it'll probably come back with questions like:

"ArticleMeta has X but not Y — do you want me to add Y for the hub page?"
"Should articles have a Publication date for sorting?"
"Should the hub page sort newest-first or by featured flag?"

Answer those concretely, then say "go" — and it builds.