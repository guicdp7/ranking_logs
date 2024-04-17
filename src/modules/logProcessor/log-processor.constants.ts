export const LOG_FORMATS = [
  {
    rule: new RegExp('new\\smatch\\s[0-9]+\\shas\\sstarted', 'i'),
    name: 'match_started',
    params: {},
  },
  {
    rule: new RegExp('match\\s[0-9]+\\shas\\sended', 'i'),
    name: 'match_ended',
    params: {},
  },
  {
    rule: new RegExp(
      '\\<WORLD\\>\\skilled\\s[a-z0-9_]+\\sby\\s[a-z0-9_]+',
      'i',
    ),
    name: 'world_kill',
    params: {},
  },
  {
    rule: new RegExp(
      '[a-z0-9_]+\\skilled\\s[a-z0-9_]+\\susing\\s[a-z0-9_]+',
      'i',
    ),
    name: 'hit_kill',
    params: {},
  },
];
