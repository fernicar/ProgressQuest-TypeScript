
import React, { useState, useEffect } from 'react';
import { K, GenerateName, Random, LevelUpTime } from '../lib/game-data';
import { GameState } from '../lib/game-engine';
import { Assets } from '../lib/assets';

export default function NewGuy({ onCancel, onCreate }: { onCancel: () => void, onCreate: (g: GameState) => void }) {
  const [name, setName] = useState('');
  const [race, setRace] = useState(K.Races[0].split('|')[0]);
  const [klass, setKlass] = useState(K.Klasses[0].split('|')[0]);
  const [stats, setStats] = useState<Record<string, number>>({});
  const [total, setTotal] = useState(0);

  const roll = () => {
    let t = 0;
    const s: Record<string, number> = {};
    K.PrimeStats.forEach(k => {
      s[k] = 3 + Random(6) + Random(6) + Random(6);
      t += s[k];
    });
    setStats(s);
    setTotal(t);
  };

  useEffect(() => {
    setName(GenerateName());
    roll();
  }, []);

  const handleSold = () => {
    const newGame: GameState = {
      Traits: { Name: name, Race: race, Class: klass, Level: 1 },
      Stats: { ...stats, 'HP Max': Random(8) + Math.floor(stats.CON/6), 'MP Max': Random(8) + Math.floor(stats.INT/6) },
      Equips: {},
      Spells: [],
      Inventory: [['Gold', 0]],
      Plots: ['Prologue'],
      Quests: [],
      ExpBar: { position: 0, max: LevelUpTime(1) },
      EncumBar: { position: 0, max: stats.STR + 10 },
      PlotBar: { position: 0, max: 26 },
      QuestBar: { position: 0, max: 1 },
      TaskBar: { position: 0, max: 2000 },
      task: '',
      kill: 'Loading...',
      act: 0,
      bestplot: 'Prologue',
      bestquest: '',
      questmonster: '',
      bestequip: 'Sharp Rock',
      bestspell: '',
      beststat: '',
      tasks: 0,
      elapsed: 0,
      queue: [
        'task|10|Experiencing an enigmatic and foreboding night vision',
        "task|6|Much is revealed about that wise old bastard you'd underestimated",
        'task|6|A shocking series of events leaves you alone and bewildered, but resolute',
        'task|4|Drawing upon an unrealized reserve of determination, you set out on a long and dangerous journey',
        'plot|2|Loading'
      ]
    };
    
    K.Equips.forEach(e => newGame.Equips[e] = '');
    newGame.Equips.Weapon = 'Sharp Rock';
    newGame.Equips.Hauberk = '-3 Burlap';

    onCreate(newGame);
  };

  const getTotalColor = () => {
      // In dark mode, colors need to be legible against dark background
      if (total > 63+18) return '#ff5555'; // Bright Red
      if (total > 4*18) return '#ffff55';  // Yellow
      if (total <= 63-18) return '#888';   // Grey
      return 'transparent';
  };

  return (
    <div className="vbox window" id="newguy">
      <div id="titlebar">
        <img src={Assets.swords} alt="" />
        <span>Progress Quest - New Character</span>
        <a id="quit" onClick={onCancel} style={{backgroundImage: `url(${Assets.closedown})`}}>
            <img src={Assets.close} alt="X" />
        </a>
      </div>
      <div className="client">
        <div className="hbox">
          <label htmlFor="Name">Name </label>
          <input id="Name" type="text" value={name} onChange={e => setName(e.target.value)} spellCheck={false} />
          <button id="RandomName" onClick={() => setName(GenerateName())}>?</button>
        </div>
        
        <div className="hbox">
           <fieldset className="vbox groupbox" id="races">
             <legend>Race</legend>
             {K.Races.map(r => {
                const rName = r.split('|')[0];
                return (
                  <div key={rName}>
                    <input type="radio" checked={race===rName} onChange={() => setRace(rName)} id={rName} name="Race" />
                    <label htmlFor={rName} onClick={() => setRace(rName)}>{rName}</label>
                  </div>
                );
             })}
           </fieldset>

           <div className="vbox">
             <div className="hbox">
                <fieldset className="vbox groupbox" id="classes">
                   <legend>Class</legend>
                   {K.Klasses.map(k => {
                      const kName = k.split('|')[0];
                      return (
                        <div key={kName}>
                          <input type="radio" checked={klass===kName} onChange={() => setKlass(kName)} id={kName} name="Class" />
                          <label htmlFor={kName} onClick={() => setKlass(kName)}>{kName}</label>
                        </div>
                      );
                   })}
                </fieldset>

                <div className="vbox">
                    <fieldset className="groupbox" id="stats">
                      <legend>Stats</legend>
                      <table>
                        <tbody>
                        {K.PrimeStats.map(s => (
                           <tr key={s}><th>{s}</th><td id={s}>{stats[s]||0}</td></tr>
                        ))}
                        <tr><th colSpan={2}>&nbsp;</th></tr>
                        <tr><th>Total</th><td id="Total" style={{backgroundColor: getTotalColor(), color: total > 4*18 ? '#000' : 'inherit'}}>{total}</td></tr>
                        </tbody>
                      </table>
                      
                      <div style={{textAlign:'center', marginTop:'20px'}}>
                        <button id="Reroll" onClick={roll}>Roll</button> <br />
                        <button id="Unroll" disabled>Unroll</button>
                      </div>
                    </fieldset>

                    <fieldset className="groupbox" id="gametype">
                        <legend>Game Type</legend>
                        <div><input type="radio" id="single" name="online" defaultChecked /><label htmlFor="single">Single player</label></div>
                        <div><input type="radio" id="multiplayer" name="online" disabled /><label htmlFor="multiplayer">Multiplayer</label></div>
                    </fieldset>
                </div>
             </div>
             
             <div className="hbox" style={{textAlign:'right', paddingTop:'15px', display:'block'}}>
               <button id="Sold" onClick={handleSold}>Sold!</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
