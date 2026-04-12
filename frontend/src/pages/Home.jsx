const restaurants = [
  {
    id: 1,
    name: "Pizza Palace",
    cuisine: "Italian",
    rating: 4.5,
    image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400",
  },
  {
    id: 2,
    name: "Biryani House",
    cuisine: "Indian",
    rating: 4.2,
    image: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=400",
  },
  {
    id: 3,
    name: "Burger Barn",
    cuisine: "American",
    rating: 4.0,
    image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400",
  },
  {
    id: 4,
    name: "Sushi World",
    cuisine: "Japanese",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400",
  },
];

const categories = [
  { id: 1, name: "Pizza", emoji: "🍕" },
  { id: 2, name: "Biryani", emoji: "🍛" },
  { id: 3, name: "Burger", emoji: "🍔" },
  { id: 4, name: "Sushi", emoji: "🍣" },
  { id: 5, name: "Pasta", emoji: "🍝" },
  { id: 6, name: "Dessert", emoji: "🍰" },
];

const Home = () => {
  return (
    <div>
      <nav className="navbar navbar-expand-lg bg-dark navbar-dark">
        <div className="container">
          <a className="navbar-brand fw-bold text-danger" href="#">
            FoodApp
          </a>
          <div className="ms-auto d-flex gap-3">
            <a href="/login" className="btn btn-outline-light btn-sm">
              Login
            </a>
            <a href="/register" className="btn btn-danger btn-sm">
              Register
            </a>
          </div>
        </div>
      </nav>

      <div className="bg-dark text-white py-5 text-center">
        <div className="container">
          <h1 className="display-4 fw-bold mb-2">Order Food You Love 🍕</h1>
          <p className="lead mb-4">Discover the best restaurants near you</p>
          <div className="input-group w-50 mx-auto">
            <input
              type="text"
              className="form-control form-control-lg"
              placeholder="Search restaurants or food..."
            />

            <button className="btn btn-danger">Search</button>
          </div>
        </div>
      </div>

      <div className="container py-5">
        <h2 className="fw-bold mb-4">What's on your mind?</h2>
        <div className="row g-3">
          {categories.map((category) => (
            <div key={category.id} className="col-6 col-md-2">
              <div
                className="card text-center h-100 border-0 shadow-sm p-3"
                style={{ cursor: "pointer" }}
              >
                <div style={{ fontSize: "2.5rem" }}>{category.emoji}</div>

                <p className="mt-2 mb-0 fw-semibold">{category.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-light py-5">
        <div className="container">
          <h2 className="fw-bold mb-4">Popular Restaurants</h2>

          <div className="row g-4">
            {restaurants.map((restaurant) => (
              <div key={restaurant.id} className="col-12 col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm">
                  <img
                    src={restaurant.image}
                    className="card-img-top"
                    alt={restaurant.name}
                    style={{ height: "180px", objectFit: "cover" }}
                  />

                  <div className="card-body">
                    <h5 className="card-title fw-bold">{restaurant.name}</h5>

                    <p className="text-muted mb-2">{restaurant.cuisine}</p>

                    <div className="d-flex justify-content-between align-items-center">
                      <span className="badge bg-success text-white">
                        ⭐ {restaurant.rating}
                      </span>

                      <button className="btn btn-danger btn-sm">
                        Order Now
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="bg-dark text-white py-4 text-center">
        <p className="mb-0">© 2024 FoodApp. Made with ❤️</p>
      </footer>
    </div>
  );
};

export default Home;
