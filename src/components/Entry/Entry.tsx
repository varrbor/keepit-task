import { useState } from 'react';
import './Entry.css';
import { ENTRY_TYPES } from '../../constants/entryTypes';
import type { EntryType } from '../../constants/entryTypes';
import type { TreeEntry } from '../../types';
import InlineInput from '../InlineInput/InlineInput';

interface EntryProps {
  entry: TreeEntry;
  depth: number;
  onConfirmCreate: (type: EntryType, name: string, parentId: number) => void;
  onDelete: (id: number) => void;
  onRename: (id: number, name: string) => void;
}

function Entry({ entry, depth, onConfirmCreate, onDelete, onRename }: EntryProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isRenaming, setIsRenaming] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [pendingChild, setPendingChild] = useState<EntryType | null>(null);
  const isDir = entry.type === ENTRY_TYPES.DIR;

  const startChildCreate = (type: EntryType) => {
    setPendingChild(type);
    setIsExpanded(true);
  };

  return (
    <div>
      <div
        className={`entry-row${isConfirmingDelete ? ' confirming' : ''}`}
        style={{ paddingLeft: `${16 + depth * 20}px` }}
      >
        {isDir ? (
          <button
            className={`entry-chevron${isExpanded ? ' open' : ''}`}
            onClick={() => setIsExpanded((v) => !v)}
          >
            ▶
          </button>
        ) : (
          <span className="entry-chevron-gap" />
        )}

        <span className="entry-icon">{isDir ? '📁' : '📄'}</span>

        {isRenaming ? (
          <InlineInput
            initialValue={entry.name}
            onConfirm={(name) => {
              onRename(entry.id, name);
              setIsRenaming(false);
            }}
            onCancel={() => setIsRenaming(false)}
          />
        ) : (
          <span className={`entry-name${isDir ? ' is-dir' : ''}`}>{entry.name}</span>
        )}

        {!isRenaming && (
          isConfirmingDelete ? (
            <div className="entry-actions">
              <span className="entry-confirm-label">Delete?</span>
              <button className="entry-btn danger" onClick={() => onDelete(entry.id)}>
                yes
              </button>
              <button className="entry-btn" onClick={() => setIsConfirmingDelete(false)}>
                no
              </button>
            </div>
          ) : (
            <div className="entry-actions">
              {isDir && (
                <>
                  <button className="entry-btn" onClick={() => startChildCreate(ENTRY_TYPES.DIR)}>
                    + folder
                  </button>
                  <button className="entry-btn" onClick={() => startChildCreate(ENTRY_TYPES.FILE)}>
                    + file
                  </button>
                </>
              )}
              <button className="entry-btn" onClick={() => setIsRenaming(true)}>
                rename
              </button>
              <button className="entry-btn danger" onClick={() => setIsConfirmingDelete(true)}>
                delete
              </button>
            </div>
          )
        )}
      </div>

      {isDir && isExpanded && (
        <div>
          {entry.subCategories.map((sub) => (
            <Entry
              key={sub.id}
              entry={sub}
              depth={depth + 1}
              onConfirmCreate={onConfirmCreate}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
          {pendingChild && (
            <div className="entry-row" style={{ paddingLeft: `${16 + (depth + 1) * 20}px` }}>
              <span className="entry-chevron-gap" />
              <span className="entry-icon">
                {pendingChild === ENTRY_TYPES.DIR ? '📁' : '📄'}
              </span>
              <InlineInput
                placeholder={pendingChild === ENTRY_TYPES.DIR ? 'Folder name…' : 'File name…'}
                onConfirm={(name) => {
                  onConfirmCreate(pendingChild, name, entry.id);
                  setPendingChild(null);
                }}
                onCancel={() => setPendingChild(null)}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Entry;
