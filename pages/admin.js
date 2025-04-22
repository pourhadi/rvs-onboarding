import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

// Available form components
const COMPONENTS = [
  { label: 'About Me', value: 'about_me' },
  { label: 'Address', value: 'address' },
  { label: 'Birthdate', value: 'birthdate' }
];

export default function Admin() {
  const [config, setConfig] = useState({ 2: [], 3: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      const { data } = await supabase.from('page_components').select('*');
      if (data) {
        const cfg = { 2: [], 3: [] };
        data.forEach((c) => {
          cfg[c.page] = [...(cfg[c.page] || []), c.component];
        });
        setConfig(cfg);
      }
      setLoading(false);
    };
    fetchConfig();
  }, []);

  // Removed checkbox-based handleChange in favor of drag-and-drop

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Clear existing config
    await supabase.from('page_components').delete().eq('page', 2);
    await supabase.from('page_components').delete().eq('page', 3);
    // Insert new config
    const inserts = [];
    [2, 3].forEach((page) => {
      (config[page] || []).forEach((component) => {
        inserts.push({ page, component });
      });
    });
    if (inserts.length) {
      await supabase.from('page_components').insert(inserts);
    }
    setLoading(false);
    alert('Configuration saved.');
  };
  // Drag and drop handler
  const handleDrop = (page) => (e) => {
    e.preventDefault();
    const component = e.dataTransfer.getData('component');
    setConfig((prev) => {
      const newConfig = {
        2: prev[2].filter((c) => c !== component),
        3: prev[3].filter((c) => c !== component),
      };
      if (page === 2 || page === 3) {
        if (!newConfig[page].includes(component)) {
          newConfig[page] = [...newConfig[page], component];
        }
      }
      return newConfig;
    });
  };

  if (loading) return <div>Loading...</div>;
  // Determine available (unassigned) components
  const assigned = new Set([...(config[2] || []), ...(config[3] || [])]);
  const availableComponents = COMPONENTS.filter(
    (c) => !assigned.has(c.value)
  );

  return (
    <div>
      <h1>Admin Configuration</h1>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {/* Available components */}
          <div
            style={{
              width: '30%',
              border: '1px solid #ccc',
              padding: '10px',
              minHeight: '150px',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop(null)}
          >
            <h2>Available Components</h2>
            {availableComponents.length === 0 ? (
              <p>None</p>
            ) : (
              availableComponents.map((c) => (
                <div
                  key={c.value}
                  draggable
                  onDragStart={(e) =>
                    e.dataTransfer.setData('component', c.value)
                  }
                  style={{
                    padding: '8px',
                    margin: '4px 0',
                    border: '1px solid #000',
                    borderRadius: '4px',
                    background: '#f9f9f9',
                    cursor: 'grab',
                  }}
                >
                  {c.label}
                </div>
              ))
            )}
          </div>

          {/* Page drop zones */}
          {[2, 3].map((page) => (
            <div
              key={page}
              style={{
                width: '30%',
                border: '1px solid #ccc',
                padding: '10px',
                minHeight: '150px',
              }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop(page)}
            >
              <h2>Page {page}</h2>
              {config[page]?.length === 0 ? (
                <p>None</p>
              ) : (
                config[page].map((value) => {
                  const comp = COMPONENTS.find((c) => c.value === value);
                  return (
                    <div
                      key={value}
                      draggable
                      onDragStart={(e) =>
                        e.dataTransfer.setData('component', value)
                      }
                      style={{
                        padding: '8px',
                        margin: '4px 0',
                        border: '1px solid #000',
                        borderRadius: '4px',
                        background: '#f1f1f1',
                        cursor: 'grab',
                      }}
                    >
                      {comp?.label || value}
                    </div>
                  );
                })
              )}
            </div>
          ))}
        </div>
        <button type="submit" style={{ marginTop: '1rem' }}>
          Save
        </button>
      </form>
    </div>
  );
}