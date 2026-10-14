#!/usr/bin/env bash
# Push Recipe Studio to a new GitHub repository.
#
#   bash scripts/push-to-github.sh [repo-name] [--private|--public]
#
# Defaults: recipe-studio, private. Needs either the GitHub CLI (`gh`,
# authenticated with `gh auth login`) or a configured git SSH remote user.
set -euo pipefail

REPO="${1:-recipe-studio}"
VISIBILITY="${2:---private}"

cd "$(dirname "$0")/.."

if [ ! -d .git ]; then
  git init -b main
fi

git add -A
if ! git diff --cached --quiet; then
  git commit -m "Recipe Studio: today's special, database with edit, ratings and delete"
fi

if command -v gh > /dev/null 2>&1; then
  # gh creates the repository and adds the remote in one step.
  if gh repo view "$REPO" > /dev/null 2>&1; then
    echo "Repository $REPO already exists — pushing to it."
    git remote add origin "https://github.com/$(gh api user -q .login)/$REPO.git" 2> /dev/null || true
  else
    gh repo create "$REPO" "$VISIBILITY" --source=. --remote=origin --push
    echo "Created and pushed: https://github.com/$(gh api user -q .login)/$REPO"
    exit 0
  fi
else
  echo "GitHub CLI not found — add the remote manually, e.g.:"
  echo "  git remote add origin git@github.com:<you>/$REPO.git"
fi

git push -u origin main
echo "Pushed. Repository: https://github.com/<you>/$REPO"
