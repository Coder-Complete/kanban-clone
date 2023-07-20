import "./App.css";
import { useState } from "react";

function App() {
  const [boards, setBoards] = useState([]);

  return (
    <>
      <header>
        <h1>cool site</h1>
      </header>
      <main>
        <section>
          <h2>section 1</h2>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias nemo
            asperiores ducimus eos excepturi, dolore corrupti corporis enim
            aliquid magni molestiae incidunt mollitia, cupiditate, quidem soluta
            voluptate necessitatibus. Odio, repellendus?
          </p>
          <button
            onClick={() => {
              fetch(import.meta.env.VITE_BACKEND_URL + "/boards")
                .then((response) => response.json())
                .then((data) => {
                  setBoards(data);
                })
                .catch((e) => console.error(e));
            }}
          >
            extra content
          </button>
          {boards.map((board) => (
            <p key={board.id}>{board.name}</p>
          ))}
        </section>
        <section className="section-two">
          <h2>section 2</h2>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias nemo
            asperiores ducimus eos excepturi, dolore corrupti corporis enim
            aliquid magni molestiae incidunt mollitia, cupiditate, quidem soluta
            voluptate necessitatibus. Odio, repellendus?
          </p>
          <button className="button-two">button two</button>
        </section>
        <section>
          <h2>section 3</h2>
          <p>
            Lorem, ipsum dolor sit amet consectetur adipisicing elit. Alias nemo
            asperiores ducimus eos excepturi, dolore corrupti corporis enim
            aliquid magni molestiae incidunt mollitia, cupiditate, quidem soluta
            voluptate necessitatibus. Odio, repellendus?
          </p>
        </section>
      </main>
    </>
  );
}

export default App;
