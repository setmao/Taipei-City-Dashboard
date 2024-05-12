// Developed by Taipei Urban Intelligence Center 2023-2024

/* authStore */
/*
The authStore stores authentication and user information.
*/

import { defineStore } from "pinia";
import http from "../router/axios";
import { useDialogStore } from "./dialogStore";
import { useContentStore } from "./contentStore";
import router from "../router/index";

export const useLocationStore = defineStore("location", {
	state: () => ({
		// This is a shortened version of the user object Taipei City Dashboard's backend will return once authenticated
		location: {
			latitude: null,
			longitude: null,
			accuracy: null,
			altitude: null,
			altitudeAccuracy: null,
			heading: null,
			speed: null,
			timestamp: null,
		},
	}),
	getters: {},
	actions: {
		async getCurrentPosition() {
			return new Promise((resolve, reject) => {
				navigator.geolocation.getCurrentPosition(
					position => resolve(position),
					error => reject(error)
				)
			})
		},
		async setLocation(location) {
			this.location = location;
		},

		async getLocation() {
			return await getCurrentPosition();
		}
	},
});
