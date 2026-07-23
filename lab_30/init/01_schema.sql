-- Lab 30: cars, users, and ownership

CREATE TABLE users (
    id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name   VARCHAR(100) NOT NULL,
    last_name    VARCHAR(100) NOT NULL,
    email        VARCHAR(255) NOT NULL UNIQUE,
    phone        VARCHAR(30),
    city         VARCHAR(100),
    country      VARCHAR(100) NOT NULL DEFAULT 'Israel',
    created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE cars (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    make           VARCHAR(100) NOT NULL,
    model          VARCHAR(100) NOT NULL,
    year           SMALLINT UNSIGNED NOT NULL,
    color          VARCHAR(50) NOT NULL,
    vin            VARCHAR(17) NOT NULL UNIQUE,
    license_plate  VARCHAR(20) NOT NULL UNIQUE,
    mileage_km     INT UNSIGNED NOT NULL DEFAULT 0,
    created_at     TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_cars_year CHECK (year BETWEEN 1980 AND 2100)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE user_cars (
    id                INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id           INT UNSIGNED NOT NULL,
    car_id            INT UNSIGNED NOT NULL,
    ownership_role    ENUM('owner', 'co_owner', 'lessee') NOT NULL DEFAULT 'owner',
    is_primary        BOOLEAN NOT NULL DEFAULT TRUE,
    owned_since       DATE NOT NULL,
    owned_until       DATE NULL,
    created_at        TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_cars_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_cars_car FOREIGN KEY (car_id) REFERENCES cars(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_car UNIQUE (user_id, car_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE INDEX idx_users_city ON users(city);
CREATE INDEX idx_cars_make_model ON cars(make, model);
CREATE INDEX idx_user_cars_user_id ON user_cars(user_id);
CREATE INDEX idx_user_cars_car_id ON user_cars(car_id);
