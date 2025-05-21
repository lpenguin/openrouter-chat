import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react';
import { Fragment, useState } from 'react';

export default function SettingsDialog({ open, onClose, initialSettings, onSave }: {
  open: boolean;
  onClose: () => void;
  initialSettings: { operouter: { token: string } };
  onSave: (settings: { operouter: { token: string } }) => void;
}) {
  const [token, setToken] = useState(initialSettings.operouter.token);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    setSaving(true);
    setError(null);
    try {
      onSave({ operouter: { token } });
      onClose();
    } catch (e) {
      setError('Failed to save settings');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Transition show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
          leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30 transition-opacity" />
        </TransitionChild>
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
              leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                <DialogTitle as="h3" className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Settings
                </DialogTitle>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">OpenRouter Token</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={token}
                    onChange={e => setToken(e.target.value)}
                  />
                </div>
                {error && <div className="text-red-500 text-sm mb-2">{error}</div>}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300"
                    onClick={onClose}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    Save
                  </button>
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
