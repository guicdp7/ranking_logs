export const LOG_FORMATS = [
  {
    rule: new RegExp('new\\smatch\\s[0-9]+\\shas\\sstarted', 'i'),
    name: 'match_started',
    params: {
      id: (text: string) => {
        return /[0-9]+/.exec(text)[0];
      },
    },
  },
  {
    rule: new RegExp('match\\s[0-9]+\\shas\\sended', 'i'),
    name: 'match_ended',
    params: {
      id: (text: string) => {
        return /[0-9]+/.exec(text)[0];
      },
    },
  },
  {
    rule: new RegExp(
      '\\<WORLD\\>\\skilled\\s[a-z0-9_]+\\sby\\s[a-z0-9_]+',
      'i',
    ),
    name: 'world_kill',
    params: {
      player: (text: string) => {
        return /killed\s[a-z0-9_]+/i.exec(text)[0].split(' ')[1];
      },
      weapon: (text: string) => {
        return /by\s[a-z0-9_]+/i.exec(text)[0].split(' ')[1];
      },
    },
  },
  {
    rule: new RegExp(
      '[a-z0-9_]+\\skilled\\s[a-z0-9_]+\\susing\\s[a-z0-9_]+',
      'i',
    ),
    name: 'hit_kill',
    params: {
      killedBy: (text: string) => {
        return /[a-z0-9_]+\skilled/i.exec(text)[0].split(' ')[0];
      },
      player: (text: string) => {
        return /killed\s[a-z0-9_]+/i.exec(text)[0].split(' ')[1];
      },
      weapon: (text: string) => {
        return /using\s[a-z0-9_]+/i.exec(text)[0].split(' ')[1];
      },
    },
  },
];
