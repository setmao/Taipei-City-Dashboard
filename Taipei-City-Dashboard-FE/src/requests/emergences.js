import http from "../router/axios";
export async function getEmergences(params) {
	// Mock
	// 	1. 災難清單（不要 lazy load，present 用沒有必要，等資料量大再讓他們痛苦）
	//     1. input
	//         1. `geo`: `json`
	//     2. output
	//         1. 位置 / `geo`: `json`
	//             1. x
	//             2. y
	//         2. 類型 / `type_id`
	//             1. name
	//         3. 名稱 / `name`: `str`
	//         4. 時間 / `datetime`: `iso string`
	//         5. 狀態 / `status`: `str`
	//         6. 相關 resource / `related_resource`: `list[str]`
	// 2. 資源清單 [消防局、消防栓、醫院、AED、緊急避難]
	//     1. output
	//         1. 位置 / `geo`: `json`
	//             1. x
	//             2. y
	//         2. 類型 / `type`: `str`
	//         3. 名稱 / `name`: `str`
	// near 25.077844115092592, longitude: 121.52449261904167
	// const result = (await http.get("emergence/resources", {})).data.data;
	// for (let index in result) {

	// 	result[index].geo = JSON.parse(result[index].Geo);
	// }

	// console.log(result);
	// return result;

	return [
		{
			geo: {
				y: 25.0778441150925,
				x: 121.522492619041
			},
			type_id: "traffic",
			name: "車禍A",
			datetime: "2021-10-01T00:00:00Z",
			status: "發生中",
		},
		{
			geo: {
				y: 25.0778441150926,
				x: 121.524492319042
			},
			type_id: "fire",
			name: "火災B",
			datetime: "2021-10-01T00:00:00Z",
			status: "發生中",
		},
		{
			geo: {
				y: 25.0778441150926,
				x: 121.524492619043
			},
			type_id: "earthquake",
			name: "地震C",
			datetime: "2021-10-01T00:00:00Z",
			status: "發生中",
		},
	]
	return http.get("/api/dev/emergence", {
		params
	});
}

export async function getEmergenceResources(params) {
	// Mock
	// 	1. 災難清單（不要 lazy load，present 用沒有必要，等資料量大再讓他們痛苦）
	//     1. input
	//         1. `geo`: `json`
	//     2. output
	//         1. 位置 / `geo`: `json`
	//             1. x
	//             2. y
	//         2. 類型 / `type_id`
	//             1. name
	//         3. 名稱 / `name`: `str`
	//         4. 時間 / `datetime`: `iso string`
	//         5. 狀態 / `status`: `str`
	//         6. 相關 resource / `related_resource`: `list[str]`
	// 2. 資源清單 [消防局、消防栓、醫院、AED、緊急避難]
	//     1. output
	//         1. 位置 / `geo`: `json`
	//             1. x
	//             2. y
	//         2. 類型 / `type`: `str`
	//         3. 名稱 / `name`: `str`
	// near 25.077844115092592, longitude: 121.52449261904167
	const result = (await http.get("emergence/resources", {})).data.data;
	for (let index in result) {

		result[index].geo = JSON.parse(result[index].Geo);
	}
	console.log(result);
	return result;
	return [
		{
			geo: {
				y: 25.0778441150925,
				x: 121.524492619041
			},
			type: "fire_station",
			name: "消防局",
		},
		{
			geo: {
				y: 25.0778441150926,
				x: 121.524492619042
			},
			type: "fire_hydrant",
			name: "消防栓",
		},
		{
			geo: {
				y: 25.0778441150926,
				x: 121.544492612043
			},
			type: "hospital",
			name: "醫院",
		},
		{
			geo: {
				y: 25.0778441150925,
				x: 121.526492519044
			},
			type: "aed",
			name: "AED",
		},
		{
			geo: {
				y: 25.0778441150927,
				x: 121.523492613046
			},
			type: "shelter",
			name: "緊急避難",
		}
	]
}