
import React, { useRef, useEffect } from 'react';
import { GameState } from '../lib/game-engine';
import { Assets } from '../lib/assets';
import { K } from '../lib/game-data';

const Bar = ({ id, value, max, hint }: { id: string, value: number, max: number, hint?: string }) => {
  const percent = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="progress-container" id={id}>
      <div className="bar" style={{ width: `${percent}%` }}></div>
      <div className="hint">{hint || Math.floor(percent) + '%'}</div>
    </div>
  );
};

export default function GameView({ game, onQuit }: { game: GameState, onQuit: () => void }) {
  // Formatters
  const roughTime = (s: number) => {
    if (s < 120) return Math.floor(s) + ' seconds';
    if (s < 7200) return Math.floor(s/60) + ' minutes';
    if (s < 172800) return Math.floor(s/3600) + ' hours';
    return Math.floor(s/86400) + ' days';
  };
  
  const xpHint = `${Math.floor(game.ExpBar.max - game.ExpBar.position)} XP needed for next level`;
  const encHint = `${game.EncumBar.position}/${game.EncumBar.max} cubits`;
  const plotHint = `${roughTime(game.PlotBar.max - game.PlotBar.position)} remaining`;
  const questHint = `${Math.floor((game.QuestBar.position / game.QuestBar.max) * 100)}% complete`;
  const taskHint = `${Math.floor((game.TaskBar.position / game.TaskBar.max) * 100)}%`;
  const plotsRef = useRef<HTMLDivElement>(null);
  const questsRef = useRef<HTMLDivElement>(null);
  const inventoryRef = useRef<HTMLDivElement>(null);

  // Auto-scroll Plots
  useEffect(() => {
    if (plotsRef.current) {
      plotsRef.current.scrollTop = plotsRef.current.scrollHeight;
    }
  }, [game.Plots.length]);

  // Auto-scroll Quests
  useEffect(() => {
    if (questsRef.current) {
      questsRef.current.scrollTop = questsRef.current.scrollHeight;
    }
  }, [game.Quests.length]);

  // Auto-scroll Inventory to highlighted item
  useEffect(() => {
      if (inventoryRef.current && game.latestInventoryIdx !== undefined && game.latestInventoryIdx >= 0) {
          const rows = inventoryRef.current.querySelectorAll('tbody tr');
          const row = rows[game.latestInventoryIdx] as HTMLElement;
          if (row) {
             row.scrollIntoView({ block: 'nearest' });
          }
      }
  }, [game.Inventory, game.latestInventoryIdx]);

  return (
    <div className="vbox window" id="main">
      <div id="titlebar">
        <img src={Assets.swords} alt="" />
        <span id="title">Progress Quest - {game.Traits.Name}</span>
        <a id="quit" onClick={onQuit} title="Quit and Save" style={{backgroundImage: `url(${Assets.closedown})`}}>
            <img src={Assets.close} alt="X" />
        </a>
      </div>

      <div className="hbox">
        <div className="vbox" id="Izquierda">
          <span className="label head">Character Sheet</span>
          <table className="listbox" id="Trats">
            <thead>
              <tr><th>Trait</th><th>Value</th></tr>
            </thead>
            <tbody id="Traits">
              {K.Traits.map((k) => <tr key={k}><td>{k}</td><td>{game.Traits[k]}</td></tr>)}
            </tbody>
            <thead className="mid">
              <tr><th>Stat</th><th>Value</th></tr>
            </thead>
            <tbody id="Stats">
              {K.Stats.map((k) => <tr key={k}><td>{k}</td><td>{game.Stats[k]}</td></tr>)}
            </tbody>
          </table>

          <div className="label">Experience</div>
          <Bar id="ExpBar" value={game.ExpBar.position} max={game.ExpBar.max} hint={xpHint} />
          
          <span className="label head">Spell Book</span>
          <div id="Spells" className="scroll listbox">
            <table>
              <thead>
                <tr><th className="key">Spell</th><th className="value">Level</th></tr>
              </thead>
              <tbody>
                {(game.Spells || []).map((it, idx) => (
                    <tr key={idx}><td>{it[0]}</td><td>{it[1]}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="vbox" id="Centro">
          <span className="label head">Equipment</span>
          <table id="Equips" className="listbox">
            <tbody>
              {Object.entries(game.Equips).map(([k,v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
            </tbody>
          </table>

          <span className="label head">Inventory</span>
          <div id="Inventory" className="scroll listbox" ref={inventoryRef}>
             <table>
                <thead><tr><th className="key">Item</th><th className="value">Qty</th></tr></thead>
                <tbody>
                  {(game.Inventory || []).map((it, i) => (
                      <tr key={i} style={{ backgroundColor: i === game.latestInventoryIdx ? 'var(--highlight)' : 'transparent' }}>
                          <td>{it[0]}</td>
                          <td>{it[1]}</td>
                      </tr>
                  ))}
                </tbody>
             </table>
          </div>

          <div className="label">Encumbrance</div>
          <Bar id="EncumBar" value={game.EncumBar.position} max={game.EncumBar.max} hint={encHint} />
        </div>

        <div className="vbox" id="Derecha">
          <span className="label head">Plot Development</span>
          <div id="Plots" className="scroll listbox" ref={plotsRef}>
             <table>
               <tbody>
                 {(game.Plots || []).map((p,i,arr) => (
                   <tr key={i}>
                     <td>
                       <input type="checkbox" checked={i < arr.length - 1} disabled style={{verticalAlign:'middle', marginRight:'4px'}} />
                       {p}
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
          </div>
          <Bar id="PlotBar" value={game.PlotBar.position} max={game.PlotBar.max} hint={plotHint} />

          <span className="label head">Quests</span>
          <div id="Quests" className="scroll listbox" ref={questsRef}>
            <table>
              <tbody>
                {(game.Quests || []).map((q,i,arr) => (
                  <tr key={i}>
                    <td>
                      <input type="checkbox" checked={i < arr.length - 1} disabled style={{verticalAlign:'middle', marginRight:'4px'}} />
                      {q}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Bar id="QuestBar" value={game.QuestBar.position} max={game.QuestBar.max} hint={questHint} />
        </div>
      </div>

      <div id="Kill" className="label">{game.kill}</div>
      <Bar id="TaskBar" value={game.TaskBar.position} max={game.TaskBar.max} hint={taskHint} />
    </div>
  );
}
