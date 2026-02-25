'use client';

import React, { useState } from 'react';
import { X, Map, Maximize, Sprout, Save } from "lucide-react";

interface NewFieldFormProps {
  onCancel: () => void;
  onSave: (data: any) => void;
}

export const NewFieldForm: React.FC<NewFieldFormProps> = ({ onCancel, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    area: '',
    culture: 'Milho',
    soilType: 'Misto'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-brand-900/40 backdrop-blur-sm" onClick={onCancel}></div>
      
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-zoom-in flex flex-col max-h-full">
        <div className="bg-brand-900 px-6 py-4 flex justify-between items-center shrink-0">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Map size={24} className="text-earth-400" />
            Cadastrar Talhão
          </h2>
          <button onClick={onCancel} className="text-brand-100 hover:text-white transition-colors bg-white/10 rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto no-scrollbar">
          <form id="new-field-form" onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-ui-text mb-1.5">Identificação do Talhão</label>
              <input 
                type="text" 
                required
                placeholder="Ex: Talhão Alvorada"
                className="w-full px-4 py-3 rounded-lg border border-concrete-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none bg-ui-bg text-ui-text font-medium"
                value={formData.name}
                onChange={e => setFormData({...formData, name: (e.target as unknown as { value: string }).value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-ui-text mb-1.5 flex items-center gap-1.5">
                  <Maximize size={16} className="text-ui-muted" /> Área (ha)
                </label>
                <input 
                  type="number" 
                  required
                  min="0.1"
                  step="0.1"
                  placeholder="0.0"
                  className="w-full px-4 py-3 rounded-lg border border-concrete-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none bg-ui-bg text-ui-text font-medium"
                  value={formData.area}
                  onChange={e => setFormData({...formData, area: (e.target as unknown as { value: string }).value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-bold text-ui-text mb-1.5 flex items-center gap-1.5">
                  <Sprout size={16} className="text-ui-muted" /> Cultura Atual
                </label>
                <select 
                  className="w-full px-4 py-3 rounded-lg border border-concrete-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none bg-ui-bg text-ui-text font-medium appearance-none"
                  value={formData.culture}
                  onChange={e => setFormData({...formData, culture: (e.target as unknown as { value: string }).value})}
                >
                  <option value="Milho">Milho</option>
                  <option value="Sorgo">Sorgo</option>
                  <option value="Soja">Soja</option>
                  <option value="Pasto">Pasto / Capim</option>
                  <option value="Pousio">Pousio (Descanso)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-ui-text mb-1.5">Tipo de Solo Predominante</label>
              <select 
                className="w-full px-4 py-3 rounded-lg border border-concrete-100 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all outline-none bg-ui-bg text-ui-text font-medium appearance-none"
                value={formData.soilType}
                onChange={e => setFormData({...formData, soilType: (e.target as unknown as { value: string }).value})}
              >
                <option value="Argiloso">Argiloso</option>
                <option value="Arenoso">Arenoso</option>
                <option value="Misto">Misto</option>
              </select>
            </div>
          </form>
        </div>

        <div className="p-6 bg-concrete-100 border-t border-concrete-100 flex gap-3 shrink-0">
          <button 
            type="button" 
            onClick={onCancel}
            className="flex-1 px-4 py-3 bg-white text-ui-text border border-concrete-100 rounded-lg font-bold hover:bg-ui-bg transition-colors active:scale-95"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            form="new-field-form"
            className="flex-1 px-4 py-3 bg-brand-900 text-white rounded-lg font-bold hover:bg-brand-700 hover:shadow-lg flex items-center justify-center gap-2 transition-all active:scale-95"
          >
            <Save size={18} />
            Salvar Talhão
          </button>
        </div>
      </div>
    </div>
  );
};
