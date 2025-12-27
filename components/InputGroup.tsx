
import React from 'react';
import { InputComponentState } from '../types';

interface InputGroupProps {
  label: string;
  state: InputComponentState;
  options: string[];
  onChange: (newState: Partial<InputComponentState>) => void;
  placeholder?: string;
  autoLabel?: string;
  optionsPlaceholder?: string;
}

const InputGroup: React.FC<InputGroupProps> = ({ label, state, options, onChange, placeholder, autoLabel, optionsPlaceholder }) => {
  return (
    <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</label>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">{autoLabel || 'Auto'}</span>
          <input
            type="checkbox"
            checked={state.auto}
            onChange={(e) => onChange({ auto: e.target.checked })}
            className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-indigo-600 focus:ring-indigo-500"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <input
          type="text"
          value={state.custom}
          onChange={(e) => onChange({ custom: e.target.value })}
          placeholder={placeholder || "Custom input..."}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 w-full"
        />
        <select
          value={state.selected}
          onChange={(e) => onChange({ selected: e.target.value })}
          className="bg-slate-900 border border-slate-700 rounded px-3 py-1.5 text-sm focus:outline-none focus:border-indigo-500 w-full"
        >
          <option value="">{optionsPlaceholder || "-- Choose Option --"}</option>
          {options.map((opt, i) => (
            <option key={i} value={opt}>{opt}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default InputGroup;
