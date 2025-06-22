use `defaultdb`;

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `img_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `img_url`) VALUES
(1, 'Voetbal', 'https://www.voetbalshirtskoning.nl/media/blog/messi-vs-ronaldo-.jpg'),
(2, 'Basketbal', 'https://imgresizer.eurosport.com/unsafe/1200x0/filters:format(jpeg)/origin-imgresizer.eurosport.com/2023/05/30/3715467-75599273-2560-1440.jpg'),
(3, 'Tennis', 'https://www.wimbledondebentureholders.com/assets/international-midpage.jpg'),
(4, 'Hockey', 'https://la28.org/content/dam/latwentyeight/olympic-sports/desktop/OLYHockeyDesktop.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `user_id` int(11) DEFAULT NULL,
  `guest_name` varchar(100) DEFAULT NULL,
  `guest_postcode` varchar(20) DEFAULT NULL,
  `guest_street` varchar(100) DEFAULT NULL,
  `guest_housenumber` varchar(20) DEFAULT NULL,
  `total_price` decimal(10,2) DEFAULT NULL,
  `status` enum('compleet','in behandeling','geannuleerd') DEFAULT 'in behandeling',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `ticket_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(8,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `roles`
--

CREATE TABLE `roles` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `roles`
--

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'admin'),
(2, 'moderator'),
(3, 'user');

-- --------------------------------------------------------

--
-- Table structure for table `tickets`
--

CREATE TABLE `tickets` (
  `id` int(11) NOT NULL,
  `title` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `price` decimal(8,2) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `img_url` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `tickets`
--

INSERT INTO `tickets` (`id`, `title`, `description`, `price`, `category_id`, `img_url`) VALUES
(1, 'Premier League Match - Arsenal vs Chelsea', 'Experience the excitement of top-tier English football with premium seating', 85.00, 1, 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
(2, 'Champions League Final Tickets', 'Witness history at the most prestigious club competition in Europe', 450.00, 1, 'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
(3, 'World Cup Qualifier', 'Support your national team in this crucial qualifying match', 125.00, 1, 'https://images.unsplash.com/photo-1489944440615-453fc2b6a9a9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
(4, 'Local Derby Match', 'Feel the passion of local rivalry in this heated derby encounter', 65.00, 1, 'https://assets.goal.com/images/v3/blt3fb087ac95d8812b/27JANUARY25_HIC_IT_IS_A_STATS_AND_FACTS_PIECE_FOR_THE_SOWETO_DERBY_16-9.jpg?auto=webp&format=pjpg&width=3840&quality=60'),
(5, 'Youth Academy Championship', 'Watch the future stars of football in this exciting youth tournament', 25.00, 1, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRoEI0uUJkxBUVVHnKG_nzq_Qt0spbyYcOptQ&s'),
(6, 'NBA Finals Game 7', 'The ultimate basketball showdown - winner takes all in Game 7', 850.00, 2, 'https://i.ytimg.com/vi/Mxv5h-RZWVs/maxresdefault.jpg'),
(7, 'College Basketball March Madness', 'Experience the intensity of March Madness tournament action', 180.00, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR4EylOk5-Yl3aJ7IIx7N7hfQ_9eTmA_JGoFw&s'),
(8, 'EuroLeague Championship', 'Top European basketball teams compete for continental supremacy', 95.00, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQyGQbGX4KQI2zESNkHetTbe0cLjFmdvp2Z6A&s'),
(9, 'NBA All-Star Game', 'Watch the best players showcase their skills in this annual spectacular', 320.00, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSy3SOQGx_6Hgub-mw3qQaH3p2fbebxjaFsVg&s'),
(10, 'High School Championship', 'Support local talent in this thrilling high school basketball final', 35.00, 2, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTDuiHMnV89ULEhUT_Ct9_ocY7aZi0NFg6ScQ&s'),
(11, 'Wimbledon Finals - Centre Court', 'The most prestigious tennis tournament - Centre Court finals experience', 750.00, 3, 'https://ichef.bbci.co.uk/images/ic/400xn/p0j6cw7y.jpg'),
(12, 'US Open Quarter Finals', 'Premium seating for the electrifying US Open quarter final matches', 285.00, 3, 'https://preview.redd.it/us-open-2024-womens-projected-quarterfinals-v0-j532y0zoz8kd1.jpeg?auto=webp&s=25b7b023d22701e0feb3eb205656e37c253284e9'),
(13, 'French Open Clay Court Classic', 'Experience the unique atmosphere of clay court tennis at Roland Garros', 195.00, 3, 'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'),
(14, 'ATP Masters 1000', 'World-class tennis featuring the top-ranked professional players', 145.00, 3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTR9snsYiOU8V_ofKIZB3sHbnccQvFyXTlzRg&s'),
(15, 'Local Tennis Championship', 'Support regional talent in this competitive local tournament', 45.00, 3, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSdtqog_jLIz5CQyteBg-M2PNP6YeJtMU00UQ&s'),
(16, 'NHL Stanley Cup Finals', 'The ultimate prize in professional hockey - Stanley Cup Finals action', 650.00, 4, 'https://media.d3.nhle.com/image/private/t_ratio16_9-size50/prd/ipqmxr83urozkxz5n3a0.jpg'),
(17, 'Winter Olympics Hockey', 'International hockey competition featuring the world\'s best teams', 225.00, 4, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRG-9O58UXjUv6v3qZcPsUDWUTeYwEQYss9-g&s'),
(18, 'College Hockey Championship', 'Exciting college-level hockey with future NHL stars', 85.00, 4, 'https://upload.wikimedia.org/wikipedia/en/6/6a/NCAA_2025_Men%27s_Frozen_Four_logo.png'),
(19, 'Professional League Playoffs', 'High-stakes playoff hockey with championship implications', 175.00, 4, 'https://csmarket.gg/blog/wp-content/uploads/2024/05/GM2EvAZWYAAcwtL_11zon.webp'),
(20, 'Youth Hockey Tournament', 'Watch the next generation of hockey talent compete', 30.00, 4, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE8_1n-e1R4vjokGM-GJE9KNZwKUB5ZnRqdA&s');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `role_id` int(11) DEFAULT 3,
  `profile_img` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `email`, `password`, `name`, `role_id`, `profile_img`) VALUES
(1, 'admin@gmail.com', '$2b$10$1eplCiGPVygYvRFvuJD/d.yKsci0fQA6eB2G2y36EF1k4nqDOv.LC', 'Admin', 3, NULL),
(2, 'mario@GMAIL.COM', '$2b$10$iGT4YMb3hTR3jvr2eJVnw.7neDGxsx6WJY5We4Li8Ej2RAfydS8be', 'Abdullah Koudimati', 1, NULL),
(3, 'mario22@gmail.com', '$2b$10$9rVQYpcEiEbtvBWDYemgTediS1hDY8ZSdbXIgAXAB24e59drHQWp2', 'mario Koudimati', 3, NULL),
(4, 'sunku@gmail.com', '$2b$10$rnEM3/W.oJVEg4uIDq455umHz1DDLQpOoY5Fwe45mSldiSWHqX/YO', 'Abdullah Koudimati', 1, '/images/user_images/profile_user_1748173035571.png'),
(5, 'test@GMAIL.COM', '$2b$10$0tCq1Vs96qt2B4xBy0KCVOXSfw04qZuH9arfF99qnWGsFQyOxwLPO', 's Koudimati', 1, 'https://www.shutterstock.com/image-vector/man-inscription-admin-icon-outline-600nw-1730974153.jpg');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `ticket_id` (`ticket_id`);

--
-- Indexes for table `roles`
--
ALTER TABLE `roles`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `tickets`
--
ALTER TABLE `tickets`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `role_id` (`role_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `roles`
--
ALTER TABLE `roles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `tickets`
--
ALTER TABLE `tickets`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `orders`
--
ALTER TABLE `orders`
  ADD CONSTRAINT `orders_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`);

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`),
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`ticket_id`) REFERENCES `tickets` (`id`);

--
-- Constraints for table `tickets`
--
ALTER TABLE `tickets`
  ADD CONSTRAINT `tickets_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);

--
-- Constraints for table `users`
--
ALTER TABLE `users`
  ADD CONSTRAINT `users_ibfk_1` FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
