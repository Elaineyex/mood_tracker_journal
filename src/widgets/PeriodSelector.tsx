import { Button, Collapse } from 'animal-island-ui';

export default function PeriodSelector({ volume, pain, color, onChange }: { 
  volume?: number;
  pain?: number;
  color?: string;
  onChange: (field: 'periodVolume' | 'periodPain' | 'periodColor', value: any) => void;
}) {
  const volumeOptions = [
    { value: 1, label: 'Spotting' }, 
    { value: 2, label: 'Light' }, 
    { value: 3, label: 'Medium' }, 
    { value: 4, label: 'Heavy' },
  ];
  const colorOptions = [
    { value: 'red', label: 'Red' }, 
    { value: 'brown', label: 'Brown' },
  ];
  const painOptions = [1, 2, 3, 4, 5];

  return (
    <Collapse
      question="Period"
      answer={
        <div className="space-y-5 period-selector">
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Volume</h3>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {volumeOptions.map(item => (
                <Button 
                  key={item.value}
                  onClick={() => onChange('periodVolume', volume === item.value ? undefined : item.value)}
                  type="default"
                  block
                  className={volume === item.value ? 'activity-button-selected' : undefined}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Color</h3>
            <div className="grid grid-cols-2 gap-3">
              {colorOptions.map(item => (
                <Button 
                  key={item.value}
                  onClick={() => onChange('periodColor', color === item.value ? undefined : item.value)}
                  type="default"
                  block
                  className={color === item.value ? 'activity-button-selected' : undefined}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Pain</h3>
              {pain && <span className="text-xs bg-[#e8f5e8] px-2 py-1 rounded-full text-[#3a6b3a] font-bold">Level {pain}</span>}
            </div>
            <div className="grid grid-cols-5 gap-2">
              {painOptions.map(value => (
                <Button
                  key={value}
                  onClick={() => onChange('periodPain', pain === value ? undefined : value)}
                  type="default"
                  block
                  className={pain === value ? 'activity-button-selected' : undefined}
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
        </div>
      }
    />
  );
}
