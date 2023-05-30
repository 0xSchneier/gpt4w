module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',
        'fix',
        'docs',
        'chore',
        'refactor',
        'style',
        'perf',
        'build',
        'revert',
        'ci',
        'test',
      ],
    ],
    'subject-full-stop': [0, 'never'],
    'subject-case': [0, 'never'],
    'subject-empty': [2, 'never'],
    'header-max-length': [0, 'always', 72],
  },
};
