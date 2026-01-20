/**
 * Page Objects Index
 * 
 * Export all page objects from a single location for easier imports.
 * 
 * Usage:
 *   const { GuestPage, AdminPage, RestaurantPage } = require('../pages');
 */

const { BasePage } = require('./BasePage');
const { AdminPage } = require('./AdminPage');
const { RestaurantPage } = require('./RestaurantPage');
const { GuestPage } = require('./GuestPage');

module.exports = {
  BasePage,
  AdminPage,
  RestaurantPage,
  GuestPage
};
