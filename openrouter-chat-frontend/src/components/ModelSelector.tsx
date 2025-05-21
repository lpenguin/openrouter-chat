import React, { useEffect, useState, Fragment } from 'react';
import { Listbox, Transition, ListboxOptions, ListboxButton, ListboxOption } from '@headlessui/react';
import { fetchOpenRouterModels } from '../services/modelService';
import type { ModelOption } from '../types/model';
import { useChatStore } from '../store/chatStore';


export default function ModelSelector() {
  const [models, setModels] = useState<ModelOption[]>([]);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const { getChatById, setChatById, currentChatId } = useChatStore();
  if (!currentChatId) return null;
  const chat = getChatById(currentChatId);
  if (!chat) return null;
  useEffect(() => {
    fetchOpenRouterModels().then(ms => {
      setModels(ms);
      console.log('Loaded models:', ms);
    }).catch(() => setModels([]));

    if (chat.model) setSelected(chat.model);
  }, [chat.model]);

  const filtered = search
    ? models.filter(m => m.name.toLowerCase().includes(search.toLowerCase()) || m.id.toLowerCase().includes(search.toLowerCase()))
    : models;

  const handleSelect = (model: string) => {
    setSelected(model);
    setChatById(chat.id, { ...chat, model });
  };

  const selectedModel = models.find(m => m.id === selected) || null;

  return (
    <div className="w-full max-w-60 ml-5">
      <Listbox value={selected} onChange={handleSelect}>
        <div className="relative mt-1">
          <ListboxButton className="relative w-full cursor-pointer rounded-lg bg-white py-2 pl-3 pr-10 text-left shadow-md border border-gray-300 focus:outline-none focus:ring-0 focus:border-gray-300 sm:text-sm flex items-center gap-2">
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 20 20" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 8l4 4 4-4" />
            </svg>
            <span className="block truncate">{selectedModel ? selectedModel.name : 'Select Model'}</span>
          </ListboxButton>
          <Transition
            as={Fragment}
            enter="transition ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
            afterLeave={() => setSearch('')}
          >
            {open => open && (
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-[16rem] min-w-[14rem] overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                <div className="px-2 py-1">
                  <input
                    className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search models..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    autoFocus
                  />
                </div>
                {filtered.length === 0 && (
                  <div className="px-4 py-2 text-gray-400">No models found</div>
                )}
                {filtered.map(m => (
                  <ListboxOption
                    key={m.id}
                    value={m.id}
                    className={({ active }: { active: boolean; selected: boolean }) =>
                      `relative cursor-pointer select-none py-2 pl-4 pr-4 ${
                        active ? 'bg-blue-100 text-blue-900' : 'text-gray-900'
                      }${selected === m.id ? ' font-bold' : ''}`
                    }
                  >
                    {({ selected: isSelected }: { selected: boolean }) => (
                      <>
                        <span className={`block truncate${isSelected ? ' font-bold' : ''}`}>{m.name}</span>
                        {isSelected ? (
                          <span className="absolute inset-y-0 left-0 flex items-center pl-1 text-blue-600">
                            ✓
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            )}
          </Transition>
        </div>
      </Listbox>
    </div>
  );
};

