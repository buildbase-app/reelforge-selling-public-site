import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { DocsNav, NavPage, NavSection } from '@/lib/docs/nav';

/**
 * The docs navigation from the BuildBase folder tree: a sticky column on wide
 * screens, a collapsible "Browse the docs" panel on phones. Server-rendered;
 * no JavaScript needed (the panel is a <details> element).
 */
export function DocsSidebar({
  nav,
  currentPath,
}: {
  nav: DocsNav;
  currentPath?: string;
}) {
  const current = nav.pages.find((p) => p.path === currentPath);
  return (
    <>
      <details className="bg-card rounded-xl border lg:hidden">
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Browse the docs
          {current && (
            <span className="text-muted-foreground font-normal">
              {' '}
              · {current.title}
            </span>
          )}
        </summary>
        <div className="border-t px-4 py-3">
          <Tree nav={nav} currentPath={currentPath} />
        </div>
      </details>
      <nav
        aria-label="Docs"
        className="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto pe-2 lg:block"
      >
        <Tree nav={nav} currentPath={currentPath} />
      </nav>
    </>
  );
}

function Tree({ nav, currentPath }: { nav: DocsNav; currentPath?: string }) {
  return (
    <div className="space-y-5 text-sm">
      <Link
        href="/docs"
        className={cn(
          'block font-medium',
          !currentPath
            ? 'text-foreground'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-current={!currentPath ? 'page' : undefined}
      >
        Overview
      </Link>
      {nav.sections.map((s) => (
        <Section key={s.id} section={s} currentPath={currentPath} depth={0} />
      ))}
      {nav.rootPages.length > 0 && (
        <Pages pages={nav.rootPages} currentPath={currentPath} />
      )}
    </div>
  );
}

function Section({
  section,
  currentPath,
  depth,
}: {
  section: NavSection;
  currentPath?: string;
  depth: number;
}) {
  return (
    <div style={depth ? { paddingInlineStart: 12 } : undefined}>
      <p className="text-muted-foreground mb-1.5 text-xs font-semibold tracking-wide uppercase">
        {section.name}
      </p>
      <Pages pages={section.pages} currentPath={currentPath} />
      {section.sections.map((child) => (
        <div key={child.id} className="mt-3">
          <Section
            section={child}
            currentPath={currentPath}
            depth={depth + 1}
          />
        </div>
      ))}
    </div>
  );
}

function Pages({
  pages,
  currentPath,
}: {
  pages: NavPage[];
  currentPath?: string;
}) {
  return (
    <ul className="space-y-0.5 border-s">
      {pages.map((p) => {
        const active = p.path === currentPath;
        return (
          <li key={p.id}>
            <Link
              href={p.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                '-ms-px block border-s py-1 ps-3 transition-colors',
                active
                  ? 'border-foreground text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground border-transparent'
              )}
            >
              {p.title}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
