import { useState } from 'react';
import axios from 'axios';

function App() {
  const [prompt, setPrompt] = useState('');
  const [sketchCode, setSketchCode] = useState('');

  const handleGenerate = async () => {
    const res = await axios.post('http://localhost:5000/api/generate-code', { prompt });
    setSketchCode(res.data.code);
  };

  return (
    <div>
      <h1>p5.js Animator</h1>
      <input
        type="text"
        placeholder="Enter a prompt..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleGenerate}>Generate Sketch</button>

      {sketchCode && (
        <iframe
          title="p5-preview"
          srcDoc={`<html><body><script src="https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.4.0/p5.js"></script><script>${sketchCode}</script></body></html>`}
          width="400"
          height="400"
          sandbox="allow-scripts"
        />
      )}
    </div>
  );
}

export default App;
