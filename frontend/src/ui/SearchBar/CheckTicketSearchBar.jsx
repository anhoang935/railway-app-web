
const CheckTicketSearchBar = ({ onSearch }) => {

    // Implementation

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Enter your ticket number"
                className="search-input"
                onChange={(e) => onSearch(e.target.value)}
            />
            <button className="search-button" onClick={() => onSearch(document.querySelector('.search-input').value)}>
                Search
            </button>
        </div>
    );
}