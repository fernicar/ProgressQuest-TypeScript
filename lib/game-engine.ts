
import { K, Pick, Random, GenerateName, toRoman, toArabic, LevelUpTime, Split } from './game-data';

export interface BarState {
  position: number;
  max: number;
  hint?: string;
  percent?: number;
}

export interface GameState {
  Traits: Record<string, any>;
  Stats: Record<string, number>;
  Equips: Record<string, string>;
  Spells: [string, string][];
  Inventory: [string, number][];
  Plots: string[];
  Quests: string[];
  
  ExpBar: BarState;
  EncumBar: BarState;
  PlotBar: BarState;
  QuestBar: BarState;
  TaskBar: BarState;
  
  task: string;
  kill: string;
  act: number;
  bestplot: string;
  bestquest: string;
  questmonster: string;
  questmonsterindex?: number;
  
  bestequip: string;
  bestspell: string;
  beststat: string;
  
  tasks: number;
  elapsed: number;
  
  queue: string[];
  date?: string;
  stamp?: number;
  seed?: number;
  latestInventoryIdx?: number;
}

// Helper Functions
function Odds(chance: number, outof: number) { return Random(outof) < chance; }
function RandSign() { return Random(2) * 2 - 1; }
function Min(a: number, b: number) { return a < b ? a : b; }
function Max(a: number, b: number) { return a > b ? a : b; }
function RandomLow(below: number) { return Min(Random(below), Random(below)); }
function PickLow(s: any[]) { return s[RandomLow(s.length)]; }
function Copy(s: string, b: number, l: number) { return s.substr(b-1, l); }
function Length(s: string) { return s.length; }
function Ends(s: string, e: string) { return s.endsWith(e); }
function Pos(needle: string, haystack: string) { return haystack.indexOf(needle) + 1; }
function StrToInt(s: string) { return parseInt(s, 10) || 0; }
function IntToStr(i: number) { return i + ""; }

function Plural(s: string) {
  if (Ends(s,'y')) return s.substring(0,s.length-1) + 'ies';
  if (Ends(s,'us')) return s.substring(0,s.length-2) + 'i';
  if (Ends(s,'ch') || Ends(s,'x') || Ends(s,'s') || Ends(s, 'sh')) return s + 'es';
  if (Ends(s,'f')) return s.substring(0,s.length-1) + 'ves';
  if (Ends(s,'man') || Ends(s,'Man')) return s.substring(0,s.length-2) + 'en';
  return s + 's';
}

function Indefinite(s: string, qty: number) {
  if (qty == 1) {
    if ('AEIOUaeiou'.indexOf(s.charAt(0)) >= 0) return 'an ' + s;
    else return 'a ' + s;
  }
  return qty + ' ' + Plural(s);
}

function Definite(s: string, qty: number) {
  if (qty > 1) s = Plural(s);
  return 'the ' + s;
}

function prefix(a: string[], m: number, s: string, sep = ' ') {
  m = Math.abs(m);
  if (m < 1 || m > a.length) return s;
  return a[m-1] + sep + s;
}

function Sick(m: number, s: string) { return prefix(['dead','comatose','crippled','sick','undernourished'], 6 - Math.abs(m), s); }
function Young(m: number, s: string) { return prefix(['foetal','baby','preadolescent','teenage','underage'], 6 - Math.abs(m), s); }
function Big(m: number, s: string) { return prefix(['greater','massive','enormous','giant','titanic'], m, s); }
function Special(m: number, s: string) {
  if (s.indexOf(' ') > -1) return prefix(['veteran','cursed','warrior','undead','demon'], m, s);
  return prefix(['Battle-','cursed ','Were-','undead ','demon '], m, s, '');
}

function NamedMonster(level: number) {
  let lev = 0;
  let result = '';
  for (let i = 0; i < 5; ++i) {
    let m = Pick(K.Monsters);
    if (!result || (Math.abs(level-StrToInt(Split(m,1))) < Math.abs(level-lev))) {
      result = Split(m,0);
      lev = StrToInt(Split(m,1));
    }
  }
  return GenerateName() + ' the ' + result;
}

function ImpressiveGuy() {
  if (Random(2)) return 'the ' + Pick(K.ImpressiveTitles) + ' of the ' + Plural(Split(Pick(K.Races), 0));
  return Pick(K.ImpressiveTitles) + ' ' + GenerateName() + ' of ' + GenerateName();
}

function BoringItem() { return Pick(K.BoringItems); }
function InterestingItem() { return Pick(K.ItemAttrib) + ' ' + Pick(K.Specials); }
function SpecialItem() { return InterestingItem() + ' of ' + Pick(K.ItemOfs); }

function MonsterTask(level: number, game: GameState) {
  let definite = false;
  for (let i = level; i >= 1; --i) {
    if (Odds(2,5)) level += RandSign();
  }
  if (level < 1) level = 1;

  let monster: string, lev: number, i: number;
  if (Odds(1,25)) {
    monster = ' ' + Split(Pick(K.Races), 0);
    if (Odds(1,2)) {
      monster = 'passing' + monster + ' ' + Split(Pick(K.Klasses), 0);
    } else {
      monster = Pick(K.Titles) + ' ' + GenerateName() + ' the' + monster;
      definite = true;
    }
    lev = level;
    monster = monster + '|' + level + '|*';
  } else if (game.questmonster && Odds(1,4)) {
    monster = game.questmonster;
    lev = StrToInt(Split(monster,1));
  } else {
    monster = Pick(K.Monsters);
    lev = StrToInt(Split(monster,1));
    for (let ii = 0; ii < 5; ++ii) {
      let m1 = Pick(K.Monsters);
      if (Math.abs(level-StrToInt(Split(m1,1))) < Math.abs(level-lev)) {
        monster = m1;
        lev = StrToInt(Split(monster,1));
      }
    }
  }

  let result = Split(monster,0);
  game.task = 'kill|' + monster;
  let qty = 1;
  if (level-lev > 10) {
    qty = Math.floor((level + Random(Math.max(lev,1))) / Math.max(lev,1));
    if (qty < 1) qty = 1;
    level = Math.floor(level / qty);
  }

  if ((level - lev) <= -10) result = 'imaginary ' + result;
  else if ((level-lev) < -5) result = Sick(5-Random(10+(level-lev)+1), Young((lev-level)-(5-Random(10+(level-lev)+1)), result));
  else if (((level-lev) < 0) && (Random(2) == 1)) result = Sick(level-lev, result);
  else if (((level-lev) < 0)) result = Young(level-lev, result);
  else if ((level-lev) >= 10) result = 'messianic ' + result;
  else if ((level-lev) > 5) result = Big(5-Random(10-(level-lev)+1), Special((level-lev)-(5-Random(10-(level-lev)+1)), result));
  else if (((level-lev) > 0) && (Random(2) == 1)) result = Big(level-lev, result);
  else if (((level-lev) > 0)) result = Special(level-lev, result);

  level = lev * qty;
  if (!definite) result = Indefinite(result, qty);
  return { 'description': result, 'level': level };
}

function EquipPrice(game: GameState) {
  return 5 * game.Traits.Level * game.Traits.Level + 10 * game.Traits.Level + 20;
}

function Add(game: GameState, listName: 'Stats' | 'Inventory', key: string, value: number) {
  if (listName === 'Stats') {
    game.Stats[key] = (game.Stats[key] || 0) + value;
  } else if (listName === 'Inventory') {
    let index = game.Inventory.findIndex(i => i[0] === key);
    if (index !== -1) {
      game.Inventory[index][1] += value;
    } else {
      game.Inventory.push([key, value]);
      index = game.Inventory.length - 1;
    }
    game.latestInventoryIdx = index;
    
    // Encumbrance
    let cubits = 0;
    game.Inventory.forEach(i => { if(i[0] !== 'Gold') cubits += i[1]; });
    game.EncumBar.position = cubits;
  }
}

function AddR(game: GameState, listName: 'Spells', key: string, value: number) {
  let spell = game.Spells.find(s => s[0] === key);
  let current = spell ? toArabic(spell[1]) : 0;
  let newVal = toRoman(current + value);
  if (spell) spell[1] = newVal;
  else game.Spells.push([key, newVal]);
}

function WinItem(game: GameState) {
  if (Math.max(250, Random(999)) < game.Inventory.length) {
    // Upscale an item? Simulating picking one
    let rows = game.Inventory.filter(i => i[0] !== 'Gold');
    if (rows.length > 0) Add(game, 'Inventory', Pick(rows)[0], 1);
    else Add(game, 'Inventory', BoringItem(), 1);
  } else {
    Add(game, 'Inventory', SpecialItem(), 1);
  }
}

function WinEquip(game: GameState) {
  let posn = Random(K.Equips.length);
  let stuff: string[], better: string[], worse: string[];
  if (!posn) {
    stuff = K.Weapons; better = K.OffenseAttrib; worse = K.OffenseBad;
  } else {
    better = K.DefenseAttrib; worse = K.DefenseBad;
    stuff = (posn == 1) ? K.Shields : K.Armors;
  }
  
  function LPick(list: string[], goal: number) {
    let result = Pick(list);
    for (let i = 1; i <= 5; ++i) {
      let s = Pick(list);
      if (Math.abs(goal-StrToInt(Split(result,1))) > Math.abs(goal-StrToInt(Split(s,1)))) result = s;
    }
    return result;
  }

  let nameRaw = LPick(stuff, game.Traits.Level);
  let qual = StrToInt(Split(nameRaw,1));
  let name = Split(nameRaw,0);
  let plus = game.Traits.Level - qual;
  if (plus < 0) better = worse;
  
  let count = 0;
  while (count < 2 && plus) {
    let modifier = Pick(better);
    let mQual = StrToInt(Split(modifier, 1));
    let mName = Split(modifier, 0);
    if (name.indexOf(mName) > -1) break;
    if (Math.abs(plus) < Math.abs(mQual)) break;
    name = mName + ' ' + name;
    plus -= mQual;
    count++;
  }
  if (plus) name = plus + ' ' + name;
  if (plus > 0) name = '+' + name;

  game.Equips[K.Equips[posn]] = name;
  game.bestequip = name;
}

function WinSpell(game: GameState) {
  let pool = K.Spells.slice(0, Math.min(game.Stats.WIS + game.Traits.Level, K.Spells.length));
  AddR(game, 'Spells', Pick(pool), 1);
  let best = 0;
  for(let i=0; i<game.Spells.length; i++) {
    if (toArabic(game.Spells[i][1]) > toArabic(game.Spells[best][1])) best = i;
  }
  if(game.Spells[best]) game.bestspell = game.Spells[best][0] + " " + game.Spells[best][1];
}

function WinStat(game: GameState) {
  let i: string;
  if (Odds(1,2)) {
    i = Pick(K.Stats.slice(0, 6)); // PrimeStats
  } else {
    // Favor best
    // Simplified logic for this port
    i = Pick(K.Stats.slice(0, 6)); 
  }
  Add(game, 'Stats', i, 1);
  // Re-calc best stat string
  let best = "STR";
  K.PrimeStats.forEach(s => { if(game.Stats[s] > game.Stats[best]) best = s; });
  game.beststat = best + " " + game.Stats[best];
}

function LevelUp(game: GameState) {
  game.Traits.Level += 1;
  game.Stats['HP Max'] = (game.Stats['HP Max'] || 0) + Math.floor(game.Stats.CON / 3) + 1 + Random(4);
  game.Stats['MP Max'] = (game.Stats['MP Max'] || 0) + Math.floor(game.Stats.INT / 3) + 1 + Random(4);
  WinStat(game);
  WinStat(game);
  WinSpell(game);
  game.ExpBar.position = 0;
  game.ExpBar.max = LevelUpTime(game.Traits.Level);
}

function CompleteQuest(game: GameState) {
  game.QuestBar.position = 0;
  game.QuestBar.max = 50 + Random(100);
  if (game.Quests.length) {
    // Completed
    // Log Quest completed
    [WinSpell, WinEquip, WinStat, WinItem][Random(4)](game);
  }
  while (game.Quests.length > 99) game.Quests.shift();
  
  game.questmonster = '';
  let caption = '';
  let r = Random(5);
  if (r === 0) {
      let level = game.Traits.Level;
      let lev = 0;
      for (let i = 1; i <= 4; ++i) {
        let m = Pick(K.Monsters);
        let l = StrToInt(Split(m,1));
        if (i == 1 || Math.abs(l - level) < Math.abs(lev - level)) {
          lev = l;
          game.questmonster = m;
        }
      }
      caption = 'Exterminate ' + Definite(Split(game.questmonster,0), 2);
  } else if (r === 1) caption = 'Seek ' + Definite(InterestingItem(), 1);
  else if (r === 2) caption = 'Deliver this ' + BoringItem();
  else if (r === 3) caption = 'Fetch me ' + Indefinite(BoringItem(), 1);
  else if (r === 4) {
      // Placate
      let m = Pick(K.Monsters);
      game.questmonster = m;
      caption = 'Placate ' + Definite(Split(m,0), 2);
      game.questmonster = '';
  }

  game.Quests.push(caption);
  game.bestquest = caption;
}

function CompleteAct(game: GameState) {
  game.act += 1;
  game.PlotBar.position = 0;
  game.PlotBar.max = 60 * 60 * (1 + 5 * game.act);
  let plotName = 'Act ' + toRoman(game.act);
  game.Plots.push(plotName);
  game.bestplot = plotName;
  if (game.act > 1) {
    WinItem(game);
    WinEquip(game);
  }
}

function InterplotCinematic(game: GameState) {
  let r = Random(3);
  if (r === 0) {
    game.queue.push('task|1|Exhausted, you arrive at a friendly oasis in a hostile land');
    game.queue.push('task|2|You greet old friends and meet new allies');
    game.queue.push('task|2|You are privy to a council of powerful do-gooders');
    game.queue.push('task|1|There is much to be done. You are chosen!');
  } else if (r === 1) {
    game.queue.push('task|1|Your quarry is in sight, but a mighty enemy bars your path!');
    let nemesis = NamedMonster(game.Traits.Level+3);
    game.queue.push('task|4|A desperate struggle commences with ' + nemesis);
    let s = Random(3);
    let act = game.act || 0;
    for (let i = 1; i <= Random(1 + act + 1); ++i) {
      s += 1 + Random(2);
      switch (s % 3) {
      case 0: game.queue.push('task|2|Locked in grim combat with ' + nemesis); break;
      case 1: game.queue.push('task|2|' + nemesis + ' seems to have the upper hand'); break;
      case 2: game.queue.push('task|2|You seem to gain the advantage over ' + nemesis); break;
      }
    }
    game.queue.push('task|3|Victory! ' + nemesis + ' is slain! Exhausted, you lose consciousness');
    game.queue.push('task|2|You awake in a friendly place, but the road awaits');
  } else {
    let nemesis2 = ImpressiveGuy();
    game.queue.push("task|2|Oh sweet relief! You've reached the kind protection of " + nemesis2);
    game.queue.push('task|3|There is rejoicing, and an unnerving encounter with ' + nemesis2 + ' in private');
    game.queue.push('task|2|You forget your ' + BoringItem() + ' and go back to get it');
    game.queue.push("task|2|What's this!? You overhear something shocking!");
    game.queue.push('task|2|Could ' + nemesis2 + ' be a dirty double-dealer?');
    game.queue.push('task|3|Who can possibly be trusted with this news!? -- Oh yes, of course');
  }
  game.queue.push('plot|1|Loading');
}

export function Tick(game: GameState, elapsedMs: number) {
  // TaskBar increment
  if (game.TaskBar.position >= game.TaskBar.max) {
    // Task Done
    game.tasks++;
    game.elapsed += game.TaskBar.max / 1000;
    game.TaskBar.position = 0;

    // Handle Task Completion
    let gain = game.task.startsWith('kill|');
    if (gain) {
      game.ExpBar.position += game.TaskBar.max / 1000;
      if (game.ExpBar.position >= game.ExpBar.max) LevelUp(game);
    }
    
    if (gain && game.act >= 1) {
      game.QuestBar.position += game.TaskBar.max / 1000;
      if (game.QuestBar.position >= game.QuestBar.max || game.Quests.length === 0) CompleteQuest(game);
    }

    if (gain || !game.act) {
      game.PlotBar.position += game.TaskBar.max / 1000;
      if (game.PlotBar.position >= game.PlotBar.max) InterplotCinematic(game);
    }

    // Dequeue / Next Task
    while (true) { // Dequeue loop
      // Process result of previous task
      if (game.task.startsWith('kill|')) {
        let parts = game.task.split('|');
        let monster = parts[1];
        if (parts[3] === '*') WinItem(game);
        else if (parts[3]) Add(game, 'Inventory', parts[1].toLowerCase() + ' ' + parts[3], 1);
      } else if (game.task === 'buying') {
        Add(game, 'Inventory', 'Gold', -EquipPrice(game));
        WinEquip(game);
      } else if (game.task === 'market' || game.task === 'sell') {
        if (game.task === 'sell') {
             if (game.Inventory.length > 1) { // 0 is Gold
                 let item = game.Inventory[1];
                 let amt = item[1] * game.Traits.Level;
                 if (item[0].indexOf(' of ') > 0) amt *= (1+RandomLow(10)) * (1+RandomLow(game.Traits.Level));
                 game.Inventory.splice(1, 1);
                 Add(game, 'Inventory', 'Gold', amt);
                 game.latestInventoryIdx = 0;
             }
        }
        if (game.Inventory.length > 1) {
            let item = game.Inventory[1];
            game.task = 'sell';
            game.kill = 'Selling ' + Indefinite(item[0], item[1]);
            game.TaskBar.max = 1 * 1000;
            break;
        }
      }

      // Check Queue
      let old = game.task;
      game.task = '';
      if (game.queue.length > 0) {
        let q = game.queue.shift()!;
        let parts = q.split('|');
        let type = parts[0];
        let n = parseInt(parts[1]);
        let s = parts[2];
        if (type === 'plot') {
          CompleteAct(game);
          s = 'Loading ' + game.bestplot;
        }
        game.kill = s + '...';
        game.TaskBar.max = n * 1000;
        break;
      } else if (game.EncumBar.position >= game.EncumBar.max) {
        game.kill = 'Heading to market to sell loot';
        game.TaskBar.max = 4000;
        game.task = 'market';
        break;
      } else if (old.indexOf('kill|') <= -1 && old !== 'heading') {
        if ((game.Inventory.find(i => i[0] === 'Gold')?.[1] || 0) > EquipPrice(game)) {
          game.kill = 'Negotiating purchase of better equipment';
          game.TaskBar.max = 5000;
          game.task = 'buying';
        } else {
          game.kill = 'Heading to the killing fields';
          game.TaskBar.max = 4000;
          game.task = 'heading';
        }
        break;
      } else {
        let t = MonsterTask(game.Traits.Level, game);
        let duration = Math.floor((2 * 3 * t.level * 1000) / game.Traits.Level);
        game.kill = 'Executing ' + t.description;
        game.TaskBar.max = duration;
        break;
      }
    }

  } else {
    game.TaskBar.position += elapsedMs;
  }
}

export function hydrateGame(game: GameState): GameState {
  if (!game.Spells) game.Spells = [];
  if (!game.Inventory) game.Inventory = [['Gold', 0]];
  if (!game.Quests) game.Quests = [];
  if (!game.Plots) game.Plots = [];

  const act = game.act || 0;
  // If Plots array length doesn't match the current Act count, reconstruct it.
  // We assume (Act + 1) items: 0 (Prologue) ... Act N
  if (game.Plots.length < act + 1) {
    game.Plots = [];
    for (let i = 0; i <= act; i++) {
        game.Plots.push(i === 0 ? "Prologue" : 'Act ' + toRoman(i));
    }
  }
  game.latestInventoryIdx = -1;

  return game;
}
