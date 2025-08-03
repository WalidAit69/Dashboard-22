import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Reception from "./pages/Reception";
import Export from "./pages/Export";
import Ecart from "./pages/Ecart";
import GestionUtilisateur from "./pages/GestionUtilisateur";
import Parcelle from "./pages/Producteur/Parcelle";
import Protocole from "./pages/Producteur/Protocole";
import DeclarationVerger from "./pages/Producteur/DeclarationVerger";
import Base from "./pages/Producteur/Base";
//import PorteGreef from "./pages/Producteur/PorteGreef";
import TypeProducteur from "./pages/Producteur/TypeProducteur";
import GroupVariete from "./pages/Produit/GroupVariete";
import Variete from "./pages/Produit/Variete";
import SousVariete from "./pages/Produit/SousVariete";
import Sidebar from "./components/Sidebar";
import AddProducteur from "./pages/Producteur/producteur/AddProducteur";
import Producteur from "./pages/Producteur/producteur/Producteur";
import ProducteurDetail from "./pages/Producteur/producteur/ProducteurDetail";
import EditProducteur from "./pages/Producteur/producteur/EditProducteur";
import Culture from "./pages/Produit/Culture";
import ProduitPage from "./pages/Produit/ProduitPage";
import BasesPage from "./pages/Bases/BasesPage";
import PorteGreef from "./pages/Bases/PorteGreffe";
import Protocoles from "./pages/Bases/Protocoles";
import Verger from "./pages/Producteur/verger/Verger";
import AddVerger from "./pages/Producteur/verger/AddVerger";
import EditVerger from "./pages/Producteur/verger/EditVerger";
import VergerDetail from "./pages/Producteur/verger/VergerDetail";

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background-100">
        <Sidebar />

        <div className="flex-1 overflow-hidden">
          <main className="h-full overflow-y-auto p-6 lg:pt-0 pt-10">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/reception" element={<Reception />} />
              <Route path="/export" element={<Export />} />
              <Route path="/ecart" element={<Ecart />} />
              <Route path="/gestion-utilisateur" element={<GestionUtilisateur />} />

              {/* Producteur routes */}
              <Route path="/producteur" element={<Producteur />} />
              <Route path="/producteur/add" element={<AddProducteur />} />
              <Route path="/producteur/:id" element={<ProducteurDetail />} />
              <Route path="/producteur/edit/:id" element={<EditProducteur />} />

              <Route path="/verger" element={<Verger />} />
              <Route path="/verger/add" element={<AddVerger />} />
              <Route path="/verger/edit/:id" element={<EditVerger />} />
              <Route path="/verger/:id" element={<VergerDetail />} />
              <Route path="/parcelle" element={<Parcelle />} />
              <Route path="/protocole" element={<Protocole />} />
              <Route path="/declaration-verger" element={<DeclarationVerger />} />
              <Route path="/base" element={<BasesPage />} />
              <Route path="/porte-greef" element={<PorteGreef />} />
              <Route path="/type-producteur" element={<TypeProducteur />} />

              {/* Produit routes */}
              <Route path="/produit" element={<ProduitPage />} />
              <Route path="/culture" element={<Culture />} />
              <Route path="/group-variete" element={<GroupVariete />} />
              <Route path="/variete" element={<Variete />} />
              <Route path="/sous-variete" element={<SousVariete />} />

              {/* Produit routes */}
              <Route path="/PorteGreef" element={<PorteGreef />} />
              <Route path="/Protocole" element={<Protocole />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;