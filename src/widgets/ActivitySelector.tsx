import { ACTIVITIES } from '../models/types';
import { Button, Collapse } from 'animal-island-ui';

export default function ActivitySelector({ selected, onChange }: { selected: string[], onChange: (val: string[]) => void }) {
  const toggleActivity = (act: string) => {
    if (selected.includes(act)) {
      onChange(selected.filter(a => a !== act));
    } else {
      onChange([...selected, act]);
    }
  };

  return (
    <div className="space-y-3 activity-collapse-list">
      {Object.entries(ACTIVITIES).map(([category, items]) => {
        return (
          <Collapse
            key={category}
            defaultExpanded={category === Object.keys(ACTIVITIES)[0]}
            question={category}
            answer={
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {items.map(item => {
                  const isSelected = selected.includes(item);
                  return (
                    <Button
                      key={item}
                      onClick={() => toggleActivity(item)}
                      type="default"
                      block
                      className={isSelected ? 'activity-button-selected' : undefined}
                    >
                      {item}
                    </Button>
                  );
                })}
              </div>
            }
          />
        );
      })}
    </div>
  );
}
