import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

export default function Data() {
  const [profiles, setProfiles] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase.from('profiles').select('*');
      if (data) setProfiles(data);
    };
    fetchData();
  }, []);

  return (
    <div>
      <h1>User Data</h1>
      <table border="1" cellPadding="5" cellSpacing="0">
        <thead>
          <tr>
            <th>ID</th>
            <th>About Me</th>
            <th>Street</th>
            <th>City</th>
            <th>State</th>
            <th>Zip</th>
            <th>Birthdate</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.about}</td>
              <td>{p.street}</td>
              <td>{p.city}</td>
              <td>{p.state}</td>
              <td>{p.zip}</td>
              <td>{p.birthdate}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}