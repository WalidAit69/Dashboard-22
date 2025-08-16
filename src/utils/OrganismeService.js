import API from './Api';

const OrganismeService = {
    // Récupérer tous les organismes
    getAllOrganismes: async (includeInactifs = false) => {
        try {
            const response = await API.get('/OrganismeCertification', {
                params: { includeInactifs }
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des organismes:', error);
            throw error;
        }
    },

    // Récupérer un organisme par ID
    getOrganismeById: async (id) => {
        try {
            const response = await API.get(`/OrganismeCertification/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'organisme:', error);
            throw error;
        }
    },

    // Créer un nouvel organisme
    createOrganisme: async (organismeData) => {
        try {
            const response = await API.post('/OrganismeCertification', organismeData);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la création de l\'organisme:', error);
            throw error;
        }
    },

    // Mettre à jour un organisme
    updateOrganisme: async (id, organismeData) => {
        try {
            const dataToSend = {
                ...organismeData,
                idOrganisme: id
            };
            const response = await API.put(`/OrganismeCertification/${id}`, dataToSend);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la mise à jour de l\'organisme:', error);
            throw error;
        }
    },

    // Supprimer un organisme (soft delete)
    deleteOrganisme: async (id) => {
        try {
            const response = await API.delete(`/OrganismeCertification/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la suppression de l\'organisme:', error);
            throw error;
        }
    },

    // Récupérer les certificats d'un organisme
    getCertificatsOrganisme: async (id) => {
        try {
            const response = await API.get(`/OrganismeCertification/${id}/certificats`);
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des certificats:', error);
            throw error;
        }
    },

    // Récupérer les statistiques des organismes
    getStatistiques: async () => {
        try {
            const response = await API.get('/OrganismeCertification/statistiques');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des statistiques:', error);
            throw error;
        }
    },

    // Récupérer uniquement les organismes actifs (pour les selects)
    getOrganismesActifs: async () => {
        try {
            const response = await API.get('/OrganismeCertification/actifs');
            return response.data;
        } catch (error) {
            console.error('Erreur lors de la récupération des organismes actifs:', error);
            throw error;
        }
    },

    // Changer le statut d'un organisme (activer/désactiver)
    toggleStatutOrganisme: async (id, actif) => {
        try {
            const response = await API.patch(`/OrganismeCertification/${id}/statut`, {
                actif: actif
            });
            return response.data;
        } catch (error) {
            console.error('Erreur lors du changement de statut:', error);
            throw error;
        }
    },

    // In OrganismeService.js
    updateStatutOrganisme: async (organismeId, statut) => {
        try {
            const response = await API.patch(`/OrganismeCertification/${organismeId}/statut`, {
                actif: statut
            });

            return response.data;
        } catch (error) {
            console.error('Erreur updateStatutOrganisme:', error);
            throw error;
        }
    }
};

export default OrganismeService;