
import React from 'react';
import { GameState, hydrateGame } from '../lib/game-engine';
import { Assets } from '../lib/assets';

function b64_decode(value: string): any {
  try {
    const stripped = value.replace(/\s/g, "");
    return JSON.parse(decodeURIComponent(escape(window.atob(stripped))));
  } catch (e) {
    console.error("Failed to decode save file", e);
    return null;
  }
}

function b64_stringify(value: any): string {
  return window.btoa(unescape(encodeURIComponent(JSON.stringify(value))));
}

export default function Roster({ games, onLoad, onDelete, onNew, onImport }: { 
  games: Record<string, GameState>, 
  onLoad: (n: string) => void, 
  onDelete: (n: string) => void,
  onNew: () => void,
  onImport: (g: GameState) => void
}) {

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onload = (evt) => {
           if (evt.target?.result) {
             const content = evt.target.result as string;
             const game = b64_decode(content);
             if (game && game.Traits && game.Traits.Name) {
               onImport(hydrateGame(game));
             } else {
               alert(`Failed to load ${file.name}: Invalid file format.`);
             }
           }
        };
        reader.readAsText(file);
      });
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <div>
       <div>
         <a href="/">
          <img src={Assets.logo} alt="Progress Quest" />
         </a>
       </div>
       <h1>Character Roster</h1>
       <p id="roster" className="banter">
         Realms of Imagination awaiting your return...
       </p>
       
       <div className="bragtable">
          {Object.values(games).map(g => (
             <div key={g.Traits.Name} className="brag">
               <table>
                <tbody>
                 <tr>
                   <td>
                     <a className="icon go" onClick={() => onLoad(g.Traits.Name)}>⚔</a>
                   </td>
                   <td>
                      <div><b>{g.Traits.Name}</b> the {g.Traits.Race} ({g.bestplot})</div>
                      <div className="rc">Level {g.Traits.Level} {g.Traits.Class}</div>
                      <div className="bs" title={g.bestequip}>{g.bestequip} / {g.bestspell} / {g.beststat}</div>
                   </td>
                   <td>
                      <a className="icon x" onClick={(e) => { e.stopPropagation(); onDelete(g.Traits.Name); }} title="Delete game">☠</a><br/>
                      <a 
                        className="save" 
                        title="Download a backup file" 
                        href={`data:text/plain;charset=utf-8,${b64_stringify(g)}`}
                        download={`${g.Traits.Name}.pqw`}
                      >💾</a>
                   </td>
                 </tr>
                 </tbody>
               </table>
             </div>
          ))}
          
          <div className="brag" style={{verticalAlign:'top'}}>
            <table style={{width:'100%', textAlign:'center'}}>
             <tbody>
              <tr>
                <td id="newc">
                  <b>New Character</b><br/>
                  <img src={Assets.dice} alt="progress on dice pips" /><br/>
                  <button id="roll" onClick={onNew}>Roll One Up</button>
                </td>
              </tr>
             </tbody>
            </table>
          </div>
       </div>

       <div className="dropinfo">
            <div>
            Your character data exists only in this browser and will disappear if the browser data is cleared.
            You can save a backup by clicking a character's <span style={{fontStyle:'normal'}}>💾</span> icon.
            To load a saved game in this browser, use this button:
            </div>
            <div>
               <label id="uploader" className="file-upload-label">
                 Load a Saved Game
                 <input 
                   type="file" 
                   accept=".pqw" 
                   multiple 
                   style={{display:'none'}} 
                   onChange={handleFileChange}
                 />
               </label>
            </div>
       </div>

    </div>
  );
}
