import React, { useMemo } from "react";

// each example has a short chip label (2-3 words) and a full prompt value
// label = what user sees on chip
// value = what gets autofilled into the input
const ROLE_EXAMPLES = {
  founder: [
    {
      label: "Feature overload",
      value:
        "Built 6 features in the first month, but users kept coming back for just one",
    },
    {
      label: "Hiring too fast",
      value:
        "Hired three people quickly, but the team started moving slower than before",
    },
    {
      label: "Building in silence",
      value:
        "Spent the first year building, nobody outside my circle knew what I was making",
    },
    {
      label: "Unclear positioning",
      value:
        "Had a product people liked but couldn't explain what it did in one sentence",
    },
    {
      label: "Delayed launch",
      value: "Kept postponing the launch waiting for it to feel ready",
    },
    {
      label: "Scope creep",
      value:
        "Said yes to every early user request and lost track of what we were actually building",
    },
    {
      label: "Runway mistake",
      value:
        "Ran out of runway faster than expected because I underestimated how long things take",
    },
    {
      label: "Investor feedback",
      value:
        "Pitched to 20 investors, most said the same thing, didn't know what to do with that",
    },
    {
      label: "Unexpected hit",
      value: "The version users loved was the one I almost didn't ship",
    },
    {
      label: "Wrong direction",
      value:
        "Spent three months on a feature, one conversation with a user changed the whole direction",
    },
  ],
  solopreneur: [
    {
      label: "Solo pace",
      value:
        "Running everything alone means some days nothing gets done and that's fine",
    },
    {
      label: "Authentic outreach",
      value:
        "Clients started coming in after I stopped trying to look bigger than I was",
    },
    {
      label: "Client boundary",
      value:
        "Set a boundary with a client once, lost them, but the next ones were easier to work with",
    },
    {
      label: "Overcommitted",
      value: "Took on too much work in one month and delivered everything late",
    },
    {
      label: "Discount trap",
      value:
        "Stopped offering discounts and the quality of clients immediately changed",
    },
    {
      label: "Time savings",
      value:
        "Built a system that saved me 10 hours a week, took 3 months to figure out",
    },
    {
      label: "Dry spell",
      value:
        "Had a dry spell for 6 weeks, kept working anyway, things picked back up",
    },
    {
      label: "Rate increase",
      value:
        "Raised my rate, lost two clients, gained one that paid more than the two combined",
    },
    {
      label: "Saying no",
      value:
        "Started saying no to projects outside my focus, referrals went up after",
    },
    {
      label: "Quiet months",
      value:
        "The quietest months were when I did the most useful work on the business",
    },
  ],
  professional: [
    {
      label: "Missed promotion",
      value:
        "Got passed over for a promotion, found out later it was because I wasn't visible enough",
    },
    {
      label: "Context dependency",
      value:
        "Switched teams and realized how much of my knowledge was context-specific",
    },
    {
      label: "Late feedback",
      value:
        "Asked for feedback for the first time in years, most of it was things I already knew",
    },
    {
      label: "Unwanted project",
      value:
        "Took on a project nobody wanted, ended up being the most useful thing I did that year",
    },
    {
      label: "No feedback loop",
      value:
        "Had a manager who never gave feedback, learned to ask better questions instead",
    },
    {
      label: "Low visibility",
      value:
        "Spent two years being good at my job without telling anyone what I was working on",
    },
    {
      label: "Job switch",
      value:
        "Left a stable job for something uncertain, the first 90 days were harder than expected",
    },
    {
      label: "Role expansion",
      value:
        "Volunteered for something outside my role, ended up redefining what my role was",
    },
    {
      label: "Always junior",
      value:
        "Realized I was the most junior person in every meeting I was in for a whole year",
    },
    {
      label: "Documenting work",
      value:
        "Started documenting my work consistently, it changed how people perceived my output",
    },
  ],
  creator: [
    {
      label: "Unpublished drafts",
      value:
        "Had a dozen post ideas saved in notes but kept not hitting publish on any of them",
    },
    {
      label: "Slow start",
      value:
        "Posted consistently for 3 months with almost no response, then one post changed that",
    },
    {
      label: "Effort vs reach",
      value:
        "Spent hours on the content I was most proud of, the quick one got 10x the reach",
    },
    {
      label: "Creative break",
      value:
        "Took a break from posting for two weeks, came back with more to say than before",
    },
    {
      label: "Sharing early",
      value:
        "Started sharing things before they were finished, engagement went up",
    },
    {
      label: "Burnout attempt",
      value: "Tried to post every day for a month, burned out by week two",
    },
    {
      label: "Repurposing content",
      value:
        "Repurposed one old post into three formats, worked better than anything new I made",
    },
    {
      label: "Niche focus",
      value:
        "Stopped trying to go viral and started writing for one specific person",
    },
    {
      label: "First criticism",
      value:
        "Got my first negative comment, spent more time on it than it deserved",
    },
    {
      label: "Hesitant post",
      value:
        "The posts I was most hesitant to share were the ones that resonated most",
    },
  ],
  developer: [
    {
      label: "Semicolon bug",
      value: "Spent 3 hours debugging, turned out to be a missing semicolon",
    },
    {
      label: "Unnecessary rewrite",
      value:
        "Rewrote a module from scratch, the original version was actually fine",
    },
    {
      label: "Framework regret",
      value:
        "Adopted a new framework for a project, regretted it halfway through",
    },
    {
      label: "Silent bug",
      value:
        "Fixed a bug that had been in production for 6 months, nobody had noticed",
    },
    {
      label: "Unreadable code",
      value: "Wrote a clever solution, future me had no idea what it did",
    },
    {
      label: "Skipped tests",
      value:
        "Skipped writing tests to ship faster, spent twice as long fixing things later",
    },
    {
      label: "Simpler pattern",
      value:
        "Switched to a simpler pattern after weeks of fighting the complex one",
    },
    {
      label: "Pair programming",
      value:
        "Pair programmed for the first time, solved in an hour what took me 2 days alone",
    },
    {
      label: "Useful deletion",
      value:
        "Deleted more code than I wrote in a refactor, things got noticeably faster",
    },
    {
      label: "Friday deploy",
      value:
        "Pushed a fix at 5pm on a Friday, spent the weekend watching the logs",
    },
  ],
  other: [
    {
      label: "Procrastination",
      value:
        "Kept putting off something for months, took 20 minutes when I finally did it",
    },
    {
      label: "Asking for help",
      value:
        "Asked for help later than I should have, things moved faster after",
    },
    {
      label: "Uncomfortable yes",
      value: "Said yes to something I wasn't ready for, figured it out anyway",
    },
    {
      label: "Over-explaining",
      value:
        "Stopped explaining myself so much, people started taking me more seriously",
    },
    {
      label: "New approach",
      value: "Took a different approach after the first one stopped working",
    },
    {
      label: "Tracking data",
      value:
        "Started tracking something I used to just guess at, the data was surprising",
    },
    {
      label: "Hard thing first",
      value:
        "Did the uncomfortable thing first thing in the morning, the rest of the day was easier",
    },
    {
      label: "Sharing early",
      value:
        "Shared something unfinished, the response was more useful than waiting would have been",
    },
    {
      label: "Needed break",
      value:
        "Took a break when I didn't think I needed one, came back with a clearer head",
    },
    {
      label: "Avoiding the key",
      value:
        "The thing I was avoiding turned out to be the most important thing to do",
    },
  ],
};

// platform fallback — used when no role is set
const PLATFORM_EXAMPLES = {
  linkedin: [
    {
      label: "Low visibility",
      value:
        "Spent two years doing good work without telling anyone what I was building",
    },
    {
      label: "Late feedback",
      value:
        "Asked for feedback for the first time in years, most of it was things I already knew",
    },
    {
      label: "Unwanted project",
      value:
        "Took on a project nobody wanted, it ended up being the most useful thing I did that year",
    },
    {
      label: "Missed promotion",
      value:
        "Got passed over for something, found out later it was because I wasn't visible enough",
    },
  ],
  twitter: [
    { label: "Semicolon bug", value: "3 hours debugging. Missing semicolon." },
    {
      label: "Hiring mistake",
      value: "Hired fast. Meetings tripled. Output dropped.",
    },
    { label: "Unpublished drafts", value: "Wrote 12 drafts. Posted none." },
    {
      label: "Feature overload",
      value: "Built 6 features. Users only needed one.",
    },
  ],
  threads: [
    {
      label: "Unpublished ideas",
      value:
        "Had a dozen ideas saved in notes but kept not hitting publish on any of them",
    },
    {
      label: "Creative break",
      value:
        "Took a break from posting for two weeks, came back with more to say",
    },
    {
      label: "Hesitant post",
      value:
        "The post I was most hesitant to share was the one that resonated most",
    },
    {
      label: "Sharing early",
      value: "Stopped trying to make everything perfect before sharing it",
    },
  ],
  default: [
    {
      label: "Procrastination",
      value:
        "Kept putting off something for months, took 20 minutes when I finally did it",
    },
    {
      label: "Asking for help",
      value:
        "Asked for help later than I should have, things moved faster after",
    },
    {
      label: "Uncomfortable yes",
      value: "Said yes to something I wasn't ready for, figured it out anyway",
    },
    {
      label: "Sharing early",
      value:
        "Shared something unfinished, the response was more useful than waiting would have been",
    },
  ],
};

// fisher-yates shuffle — different order each page load
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function PromptExamples({ onSelect, inputRef, role, platform }) {
  // empty deps — shuffles once on mount, stable for the session
  const chips = useMemo(() => {
    const roleExamples = role ? ROLE_EXAMPLES[role] : null;

    if (roleExamples) {
      return shuffle(roleExamples).slice(0, 5);
    }

    // fall back to platform-specific if no role
    const platformExamples =
      PLATFORM_EXAMPLES[platform] || PLATFORM_EXAMPLES.default;
    return shuffle(platformExamples).slice(0, 5);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleClick = (value) => {
    onSelect(value);
    const el = inputRef?.current;
    if (!el) return;
    el.focus();
    if (el.setSelectionRange) el.setSelectionRange(value.length, value.length);
  };

  return (
    <div className="mt-3 overflow-x-auto sm:overflow-x-visible">
      <div className="flex gap-2 sm:flex-wrap w-max sm:w-auto pb-0.5">
        {chips.map((ex) => (
          <button
            key={ex.label}
            type="button"
            onClick={() => handleClick(ex.value)}
            className="flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-inter font-medium
              border border-black/[0.08] dark:border-white/[0.08]
              bg-black/[0.03] dark:bg-white/[0.04]
              text-textLight/60 dark:text-textDark/50
              hover:border-brand/40 hover:text-brand hover:bg-brand/[0.04]
              dark:hover:border-brand/40 dark:hover:text-brand-soft dark:hover:bg-brand/[0.06]
              transition-all duration-150 whitespace-nowrap"
          >
            {ex.label}
          </button>
        ))}
      </div>
    </div>
  );
}
