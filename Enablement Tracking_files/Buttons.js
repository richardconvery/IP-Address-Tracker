class Buttons {
    static get(params = {}) {
        if (!params.hasOwnProperty('name')) {
            return '';
        }
        let name = params.name;
        let buttonHtml = '';
        let url  = '#';
        switch(name) {
            case 'archive-undo':
                if (params.hasOwnProperty('id')) {
                    url = `/archive/${params.id}?action=undo`;
                }
                buttonHtml = `<a href="${url}" class="btn btn-white text-primary btn-icon setting-btn" title="Undo" data-toggle="tooltip">
                <i class="bi bi-arrow-counterclockwise"></i>
                </a>`;
                break;
            case 'archive-delete':
                if (params.hasOwnProperty('id')) {
                    url = `/archive/${params.id}?action=delete`;
                }
                buttonHtml = `<a href="${url}" class="btn btn-white text-danger btn-icon setting-btn" title="Delete" data-toggle="tooltip">
                <i class="bi bi-trash"></i>
                </a>`;
                break; 
            case 'cancel-modal':
                buttonHtml = ` <button type="button" class="btn btn-white text-left" data-bs-dismiss="modal" aria-label="Close">Cancel</button>`;
                break; 
            default: 
                buttonHtml =  '';
        }
        return buttonHtml;
    }
}