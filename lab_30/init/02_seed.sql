-- Dummy seed data for users, cars, and ownership

INSERT INTO users (first_name, last_name, email, phone, city, country) VALUES
('Alice', 'Cohen', 'alice.cohen@example.com', '+972-50-111-0001', 'Tel Aviv', 'Israel'),
('Bob', 'Levy', 'bob.levy@example.com', '+972-50-111-0002', 'Haifa', 'Israel'),
('Carol', 'Mizrahi', 'carol.mizrahi@example.com', '+972-50-111-0003', 'Jerusalem', 'Israel'),
('Dave', 'Ben-David', 'dave.bendavid@example.com', '+972-50-111-0004', 'Beer Sheva', 'Israel'),
('Eve', 'Shapiro', 'eve.shapiro@example.com', '+972-50-111-0005', 'Netanya', 'Israel'),
('Frank', 'Azoulay', 'frank.azoulay@example.com', '+972-50-111-0006', 'Rishon LeZion', 'Israel'),
('Grace', 'Peretz', 'grace.peretz@example.com', '+972-50-111-0007', 'Herzliya', 'Israel'),
('Henry', 'Goldstein', 'henry.goldstein@example.com', '+972-50-111-0008', 'Ashdod', 'Israel'),
('Iris', 'Katz', 'iris.katz@example.com', '+972-50-111-0009', 'Tel Aviv', 'Israel'),
('Jack', 'Rosen', 'jack.rosen@example.com', '+972-50-111-0010', 'Ramat Gan', 'Israel'),
('Kate', 'Weiss', 'kate.weiss@example.com', '+972-50-111-0011', 'Petah Tikva', 'Israel'),
('Leo', 'Abramov', 'leo.abramov@example.com', '+972-50-111-0012', 'Haifa', 'Israel');

INSERT INTO cars (make, model, year, color, vin, license_plate, mileage_km) VALUES
('Toyota', 'Corolla', 2021, 'White', 'JTDBR32E720000001', '12-345-67', 42000),
('Toyota', 'RAV4', 2022, 'Silver', 'JTMBFREV5N5000002', '23-456-78', 31000),
('Honda', 'Civic', 2020, 'Blue', '2HGFC2F59LH000003', '34-567-89', 58000),
('Honda', 'CR-V', 2023, 'Black', '7FARW2H58NE000004', '45-678-90', 15000),
('Mazda', '3', 2019, 'Red', 'JM1BPBJM5K1000005', '56-789-01', 72000),
('Mazda', 'CX-5', 2021, 'Gray', 'JM3KFBCM5M1000006', '67-890-12', 39000),
('Hyundai', 'Ioniq 5', 2023, 'White', 'KM8KRDAF5PU000007', '78-901-23', 18000),
('Kia', 'Sportage', 2022, 'Green', 'KNDPMCAC5N7000008', '89-012-34', 27000),
('Tesla', 'Model 3', 2024, 'Black', '5YJ3E1EA1PF000009', '90-123-45', 8000),
('BMW', '320i', 2018, 'Blue', 'WBA8E9C50J0000010', '01-234-56', 95000),
('Mercedes-Benz', 'C200', 2020, 'Silver', 'WDDWF8EB5LR000011', '13-579-24', 61000),
('Volkswagen', 'Golf', 2017, 'Yellow', 'WVWZZZ1KZHW000012', '24-680-35', 110000),
('Skoda', 'Octavia', 2021, 'Gray', 'TMBJG7NE5M0000013', '35-791-46', 44000),
('Ford', 'Focus', 2016, 'White', '1FADP3F20GL000014', '46-802-57', 128000),
('Nissan', 'Qashqai', 2022, 'Orange', 'SJNFBAJ11U2000015', '57-913-68', 25000);

INSERT INTO user_cars (user_id, car_id, ownership_role, is_primary, owned_since, owned_until) VALUES
(1, 1, 'owner', TRUE, '2021-06-15', NULL),
(1, 9, 'owner', FALSE, '2024-02-01', NULL),
(2, 2, 'owner', TRUE, '2022-03-20', NULL),
(3, 3, 'owner', TRUE, '2020-11-05', NULL),
(3, 5, 'co_owner', FALSE, '2021-01-10', NULL),
(4, 4, 'owner', TRUE, '2023-05-12', NULL),
(5, 5, 'owner', TRUE, '2019-08-30', NULL),
(6, 6, 'owner', TRUE, '2021-09-18', NULL),
(6, 12, 'lessee', FALSE, '2024-01-01', '2025-12-31'),
(7, 7, 'owner', TRUE, '2023-07-22', NULL),
(8, 8, 'owner', TRUE, '2022-10-03', NULL),
(9, 10, 'owner', TRUE, '2018-04-14', NULL),
(9, 1, 'co_owner', FALSE, '2023-01-01', NULL),
(10, 11, 'owner', TRUE, '2020-12-01', NULL),
(11, 13, 'owner', TRUE, '2021-04-09', NULL),
(11, 15, 'owner', FALSE, '2022-08-15', NULL),
(12, 14, 'owner', TRUE, '2017-02-28', NULL),
(12, 3, 'co_owner', FALSE, '2022-06-01', NULL),
(2, 15, 'co_owner', FALSE, '2023-03-11', NULL),
(4, 7, 'co_owner', FALSE, '2024-01-20', NULL);
