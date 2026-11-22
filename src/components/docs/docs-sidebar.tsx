import { Link } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import type { DocsNav, NavPage, NavSection } from '@/lib/docs/nav';
import styles from './docs-prose.module.css';

/**
 * The docs navigation from the BuildBase folder tree: a sticky column on wide
 * screens, a collapsible "Browse the docs" panel on phones. Server-rendered;
 * no JavaScript needed (the panel is a <details> element). Rows are 32px with
 * 2px between them; a folder name sits 8px above its pages and 24px below the
 * folder before it. The current page carries the docs' one accent.
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
      <details className={cn('rounded-xl border lg:hidden', styles.line)}>
        <summary className="cursor-pointer px-4 py-3 text-sm font-medium">
          Browse the docs
          {current && (
            <span className="text-muted-foreground font-normal">
              {' '}
              · {current.title}
            </span>
          )}
        </summary>
        <div className={cn('border-t px-4 py-4', styles.line)}>
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
    <div className="space-y-6 text-sm">
      <Link
        href="/docs"
        className={cn(
          'block transition-colors',
          !currentPath
            ? 'text-foreground font-medium'
            : 'text-muted-foreground hover:text-foreground'
        )}
        aria-current={!currentPath ? 'page' : undefined}
      >
        Overview
      </Link>
      {nav.sections.map((s) => (
        <Section key={s.id} section={s} currentPath={currentPath} />
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
}: {
  section: NavSection;
  currentPath?: string;
}) {
  return (
    <div>
      <p className="text-foreground mb-2 font-medium">{section.name}</p>
      <Pages pages={section.pages} currentPath={currentPath} />
      {section.sections.map((child) => (
        <div key={child.id} className="mt-4 ps-3">
          <Section section={child} currentPath={currentPath} />
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
    <ul className={cn('space-y-0.5 border-s', styles.line)}>
      {pages.map((p) => {
        const active = p.path === currentPath;
        return (
          <li key={p.id}>
            <Link
              href={p.href}
              aria-current={active ? 'page' : undefined}
              className={cn(
                '-ms-px block border-s border-transparent py-1.5 ps-3 leading-5 transition-colors',
                active
                  ? cn('text-foreground font-medium', styles.current)
                  : 'text-muted-foreground hover:text-foreground'
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
