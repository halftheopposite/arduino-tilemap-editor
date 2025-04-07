import { ReactElement } from "react";
import { EditorProvider } from "../context/EditorContext";
import Header from "./Header";
import MainContent from "./MainContent";
import Sidebar from "./Sidebar";

function App(): ReactElement {
  return (
    <EditorProvider>
      <div className="app-wrapper">
        <Header />
        <div className="container">
          <Sidebar />
          <MainContent />
        </div>
      </div>
    </EditorProvider>
  );
}

export default App;
