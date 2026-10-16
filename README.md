# ExpiryAlert

ExpiryAlert is a simple inventory management web application that helps users keep track of their items, monitor expiry dates, and manage waste. The main idea behind this project is to make it easier to know which items are safe to use, which are close to expiry, and which have already expired.

I built this project to practice frontend development and understand how different features of a web application work together.

## Features

- **Dashboard:** View total items, expired items, items expiring soon, and wasted items in one place.

- **Inventory Management:** Add, edit, search, filter, sort, and delete inventory items.

- **Expiry Tracking:** Automatically check expiry dates and display the current status of each item.

- **Analytics:** View category-wise inventory distribution and an overview of expiry status.

- **Waste Tracker:** Mark items as wasted, view waste history, check total wasted quantity, and restore items to the inventory when needed.

- **Local Data Storage:** Save inventory data in the browser using LocalStorage, so the data remains available after refreshing the page on the same browser.

## Technologies Used

- HTML5

- CSS3

- JavaScript

- Browser LocalStorage

## 

## How It Works

Users can add items by entering their name, category, quantity, expiry date, and optional notes. ExpiryAlert uses the saved expiry dates to classify items as expired, expiring soon, or not expiring soon.

The dashboard provides a quick overview of the inventory, while the Analytics page displays category and expiry information. Items that are marked as wasted are moved out of the active inventory and listed in the Waste Tracker. They can also be restored if needed.

The application currently uses browser LocalStorage to save data. This means the inventory is stored locally in the browser and is not automatically shared across different devices or browsers.

## Future Improvements

Some features I would like to add in future versions include:

- Notifications for upcoming expiry dates

- A more responsive layout for mobile devices

- Backend integration and database support

- User authentication and individual inventories

- Data export and backup options

## What I Learned

While building ExpiryAlert, I practised working with JavaScript functions, DOM manipulation, event handling, array methods, date validation, and LocalStorage. I also learned how to connect different sections of a web application and keep the displayed data updated when users make changes.

## Author

**Sohaib Akhtar**

[B.Tech](http://B.Tech) CSE Student

This project is part of my learning journey in web development.