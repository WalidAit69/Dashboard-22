import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Reception from "./pages/Gestion/Reception";
import Export from "./pages/Gestion/Export";
import Ecart from "./pages/Gestion/Ecart";
import GestionUtilisateur from "./pages/Gestion/GestionUtilisateur";
import Sidebar from "./components/Sidebar";
import AddProducteur from "./pages/Gestion/Producteur/producteur/AddProducteur";
import Producteur from "./pages/Gestion/Producteur/producteur/Producteur";
import ProducteurDetail from "./pages/Gestion/Producteur/producteur/ProducteurDetail";
import EditProducteur from "./pages/Gestion/Producteur/producteur/EditProducteur";
import ProduitPage from "./pages/Gestion/Produit/ProduitPage";
import BasesPage from "./pages/Gestion/Producteur/Bases/BasesPage";
import Verger from "./pages/Gestion/Producteur/verger/Verger";
import AddVerger from "./pages/Gestion/Producteur/verger/AddVerger";
import EditVerger from "./pages/Gestion/Producteur/verger/EditVerger";
import VergerDetail from "./pages/Gestion/Producteur/verger/VergerDetail";
import Parcelle from "./pages/Gestion/Producteur/parcelle/Parcelle";
import AddParcelle from "./pages/Gestion/Producteur/parcelle/AddParcelle";
import EditParcelle from "./pages/Gestion/Producteur/parcelle/EditParcelle";
import ParcelleDetail from "./pages/Gestion/Producteur/parcelle/ParcelleDetail";
import CertificatPage from "./pages/Gestion/Producteur/certificat/CertificatPage";
import OrganismePage from "./pages/Gestion/Producteur/certificat/OrganismePage";
import DeclarationVerger from "./pages/Gestion/Producteur/DeclarationVerger/DeclarationVerger";
import AddDeclarationVerger from "./pages/Gestion/Producteur/DeclarationVerger/AddDeclarationVerger";
import EditDeclarationVerger from "./pages/Gestion/Producteur/DeclarationVerger/EditDeclarationVerger";

// Layout Components
import GestionLayout from "./layouts/GestionLayout";
import AnalyticsLayout from "./layouts/AnalyticsLayout";

function App() {
  return (
    <Router>
      <div className="flex h-screen bg-background-100">
        <Sidebar />

        <div className="flex-1 overflow-hidden">
          <main className="h-full overflow-y-auto p-6 lg:pt-0 pt-10">
            <Routes>
              {/* Root Dashboard */}
              <Route path="/" element={<Dashboard />} />

              {/* Gestion Routes */}
              <Route path="/gestion/*" element={<GestionLayout />}>
                <Route index element={<Reception />} />
                <Route path="reception" element={<Reception />} />
                <Route path="export" element={<Export />} />
                <Route path="ecart" element={<Ecart />} />
                <Route path="gestion-utilisateur" element={<GestionUtilisateur />} />

                {/* Producteur routes */}
                <Route path="producteur" element={<Producteur />} />
                <Route path="producteur/add" element={<AddProducteur />} />
                <Route path="producteur/:id" element={<ProducteurDetail />} />
                <Route path="producteur/edit/:id" element={<EditProducteur />} />

                {/* Verger routes */}
                <Route path="verger" element={<Verger />} />
                <Route path="verger/add" element={<AddVerger />} />
                <Route path="verger/edit/:id" element={<EditVerger />} />
                <Route path="verger/:id" element={<VergerDetail />} />

                {/* Parcelle routes */}
                <Route path="parcelle" element={<Parcelle />} />
                <Route path="parcelle/add" element={<AddParcelle />} />
                <Route path="parcelle/edit/:id" element={<EditParcelle />} />
                <Route path="parcelle/:id" element={<ParcelleDetail />} />

                {/* Declaration Verger routes */}
                <Route path="declaration-verger" element={<DeclarationVerger />} />
                <Route path="declaration-verger/add" element={<AddDeclarationVerger />} />
                <Route path="declaration-verger/edit/:id" element={<EditDeclarationVerger />} />

                {/* Other routes */}
                <Route path="certificat" element={<CertificatPage />} />
                <Route path="organisme" element={<OrganismePage />} />
                <Route path="base" element={<BasesPage />} />

                {/* Produit routes */}
                <Route path="produit" element={<ProduitPage />} />
              </Route>

              {/* Analytics Routes */}
              <Route path="/analytics/*" element={<AnalyticsLayout />}>
                {/* Add your analytics routes here */}
                <Route index element={<div>Analytics Dashboard</div>} />
                <Route path="reports" element={<div>Reports</div>} />
                <Route path="metrics" element={<div>Metrics</div>} />
              </Route>
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;