import { PenLine, ChevronUp, Sparkles, RefreshCw } from 'lucide-react';
import { Button } from './Button';

/**
 * Reusable Category & Section Hero Banner
 * Ensures clean responsive hierarchy on all screen sizes.
 */
export const CategoryHero = ({
  icon: Icon,
  title,
  badge,
  tagline,
  isComposing = false,
  onToggleCompose,
  composeLabel = 'Write',
  prompt,
  onNextPrompt,
  onUsePrompt,
  children,
}) => {
  return (
    <header className="category-hero paper-texture">
      <div className="category-hero-top">
        <div className="category-hero-identity">
          {Icon && (
            <div className="category-hero-icon">
              <Icon size={22} strokeWidth={2.2} />
            </div>
          )}

          <div className="category-hero-headings">
            <div className="category-hero-title-row">
              <h1 className="category-hero-title">{title}</h1>
              {badge !== undefined && badge !== null && (
                <span className="category-hero-badge">{badge}</span>
              )}
            </div>
          </div>
        </div>

        {onToggleCompose && (
          <div className="category-hero-cta">
            <Button
              onClick={onToggleCompose}
              leftIcon={isComposing ? <ChevronUp size={15} /> : <PenLine size={15} />}
              className="btn-primary category-hero-btn"
            >
              {isComposing ? 'Close' : composeLabel}
            </Button>
          </div>
        )}
      </div>

      {tagline && <p className="category-hero-subtitle">{tagline}</p>}

      {prompt && (
        <div className="category-prompt-box">
          <div className="category-prompt-text-wrap">
            <Sparkles size={15} className="category-prompt-icon" />
            <p className="category-prompt-quote">&ldquo;{prompt}&rdquo;</p>
          </div>
          <div className="category-prompt-actions">
            {onNextPrompt && (
              <button
                type="button"
                onClick={onNextPrompt}
                className="category-prompt-btn-next"
                title="Next prompt"
              >
                <RefreshCw size={12} />
                <span>Another</span>
              </button>
            )}
            {onUsePrompt && (
              <button
                type="button"
                onClick={() => onUsePrompt(prompt)}
                className="category-prompt-btn-use"
              >
                Use prompt
              </button>
            )}
          </div>
        </div>
      )}

      {children}
    </header>
  );
};

export default CategoryHero;
