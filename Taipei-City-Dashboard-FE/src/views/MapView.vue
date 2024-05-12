<!-- Developed By Taipei Urban Intelligence Center 2023-2024 -->
<!-- 
Lead Developer:  Igor Ho (Full Stack Engineer)
Data Pipelines:  Iima Yu (Data Scientist)
Design and UX: Roy Lin (Fmr. Consultant), Chu Chen (Researcher)
Systems: Ann Shih (Systems Engineer)
Testing: Jack Huang (Data Scientist), Ian Huang (Data Analysis Intern) 
-->
<!-- Department of Information Technology, Taipei City Government -->

<!-- Map charts will be hidden in mobile mode and be replaced with the mobileLayers dialog -->

<script setup>
import { computed, ref, onMounted } from "vue";
import { DashboardComponent } from "city-dashboard-component";
import { useContentStore } from "../store/contentStore";
import { useDialogStore } from "../store/dialogStore";
import { useMapStore } from "../store/mapStore";
import { useLocationStore } from "../store/userLocationStore";
import { getEmergences, getEmergenceResources } from "../requests/emergences";

import MapContainer from "../components/map/MapContainer.vue";
import MoreInfo from "../components/dialogs/MoreInfo.vue";
import ReportIssue from "../components/dialogs/ReportIssue.vue";

const contentStore = useContentStore();
const dialogStore = useDialogStore();
const mapStore = useMapStore();
const locationStore = useLocationStore();
// Separate components with maps from those without
const parseMapLayers = computed(() => {
  const hasMap = contentStore.currentDashboard.components?.filter(
    (item) => item.map_config[0]
  );
  const noMap = contentStore.currentDashboard.components?.filter(
    (item) => !item.map_config[0]
  );

  return { hasMap: hasMap, noMap: noMap };
});
const emergences = ref([]);
const emergenceResources = ref([]);
const focusedEmergence = ref(null);
const focusedEmergenceResource = ref(null);

getEmergences().then((result) => {
  mapStore.map.on("load", () => {
    emergences.value = result;
    console.log(result);
    mapStore.map.getSource("emergence").setData({
      type: "FeatureCollection",
      features: emergences.map((emergence) => {
        return {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [emergence.geo.x, emergence.geo.y],
          },
          properties: {
            name: emergence.name,
            type_id: emergence.type_id,
            status: emergence.status,
            datetime: emergence.datetime,
          },
        };
      }),
    });
  });
});
getEmergenceResources().then((result) => {
  emergenceResources.value = result.slice(0, 100);
  console.log(result);
});
function padZero(num, targetLength) {
  return String(num).padStart(targetLength, "0");
}

function ddToDms(deg, latOrlon) {
  var absolute = Math.abs(deg);
  var degrees = Math.floor(absolute);
  var minNt = (absolute - degrees) * 60;
  var minutes = Math.floor(minNt);
  var seconds = ((minNt - minutes) * 60).toFixed(2);
  var secs = Math.floor(seconds);

  // Get cardinal direction
  if (latOrlon == "lat") {
    var direction = deg >= 0 ? "N" : "S";
  } else if (latOrlon == "lon") {
    var direction = deg >= 0 ? "E" : "W";
  }

  // Ensure 60 minutes add 1 to degree and 60 seconds add 1 to minutes
  if (seconds == 60) {
    minutes++;
    seconds = 0;
  }
  if (minutes == 60) {
    degrees++;
    minutes = 0;
  }

  // Pad with zero
  if (
    (degrees < 10 && latOrlon == "lat") ||
    (degrees > 10 && degrees < 100 && latOrlon == "lon")
  ) {
    var degrees = padZero(degrees, String(degrees).length + 1);
  } else if (degrees < 10 && latOrlon == "lon") {
    var degrees = padZero(degrees, String(degrees).length + 2);
  }
  if (minutes < 10) {
    var minutes = padZero(minutes, String(minutes).length + 1);
  }
  if (secs < 10) {
    var seconds = padZero(seconds, String(seconds).length + 1);
  }

  // Validate lat and lon
  if (deg > 90 && latOrlon == "lat") {
    alert("LATITUDE CANNOT BE MORE THAN 90");
  } else if (deg > 180 && latOrlon == "lon") {
    alert("LONGITUDE CANNOT BE MORE THAN 180");
  } else {
    return degrees + "°" + minutes + "'" + seconds + '"' + direction;
  }
}
function handleOpenSettings() {
  contentStore.editDashboard = JSON.parse(JSON.stringify(contentStore.currentDashboard));
  dialogStore.addEdit = "edit";
  dialogStore.showDialog("addEditDashboards");
}

// Open and closes the component as well as communicates to the mapStore to turn on and off map layers
function handleToggle(value, map_config) {
  if (!map_config[0]) {
    if (value) {
      dialogStore.showNotification("info", "本組件沒有空間資料，不會渲染地圖");
    }
    return;
  }
  if (value) {
    mapStore.addToMapLayerList(map_config);
    console.log(map_config);
  } else {
    mapStore.clearByParamFilter(map_config);
    mapStore.turnOffMapLayerVisibility(map_config);
  }
}
const emergeTypes = {
  earthquake: "地震",
  traffic: "車禍",
  fire: "火災",
};
function getEmergenceIcon(type_id) {
  return `/src/assets/images/icons/emerg-${type_id}.png`;
}
// 1. fire_station
// 2. fire_hydrant
// 3. hospital
// 4. aed
// 5. shelter
const resourceTypes = {
  fire_station: "消防局",
  fire_hydrant: "消防栓",
  hospital: "醫院",
  aed: "AED",
  shelter: "避難所",
};
function getResourceIcon(type_id) {
  return `/src/assets/images/icons/resource-aed.png`;
}
function getResourceName(type_id) {
  return resourceTypes[type_id];
}
function shouldDisable(map_config) {
  const allMapLayerIds = map_config.map((el) => `${el.index}-${el.type}`);

  return mapStore.loadingLayers.filter((el) => allMapLayerIds.includes(el)).length > 0;
}
onMounted(() => {
  mapStore.map.on("load", () => {
    mapStore.map.addSource("emergences-source", {
      type: "geojson",
      data: {
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [25.0778441150925, 121.524492619041],
            },
          },
        ],
      },
    });

    // Add a layer to use the image to represent the data.
    mapStore.map.addLayer({
      id: "emergences-source",
      type: "circle",
      source: "emergences-source", // reference the data source
      layout: {
        "icon-image": "emerg-traffic", // reference the image
        "icon-size": 1,
      },
    });
    const map_config = {
      id: 43,
      index: "emergences",
      title: "閒置市有(公用)建物",
      type: "circle",
      source: "geojson",
      size: "big",
      icon: null,
      paint: {
        "circle-color": "#655fad",
      },
      property: [
        {
          key: "門牌",
          name: "門牌",
        },
        {
          key: "房屋現況",
          name: "房屋現況",
        },
        {
          key: "目前執行情形",
          name: "目前執行情形",
        },
        {
          key: "閒置樓層_閒置樓層/該建物總樓層",
          name: "閒置樓層/總樓層",
        },
        {
          key: "閒置面積㎡",
          name: "閒置面積㎡",
        },
        {
          key: "基地管理機關",
          name: "基地管理機關",
        },
        {
          key: "建物管理機關",
          name: "建物管理機關",
        },
        {
          key: "原使用用途",
          name: "原使用用途",
        },
        {
          key: "基地所有權人",
          name: "基地所有權人",
        },
        {
          key: "建物標示",
          name: "建物標示",
        },
        {
          key: "建築完成日期",
          name: "建築完成日期",
        },
      ],
    };
    mapStore.addToMapLayerList([
      {
        index: "emergences",
        type: "circle",
        map_config: [map_config],
      },
    ]);
  });
});
</script>

<template>
  <div class="map">
    <div class="hide-if-mobile">
      <!-- 1. If the dashboard is map-layers -->
      <div v-if="contentStore.currentDashboard.index === 'map-layers'" class="map-charts">
        <DashboardComponent
          v-for="item in contentStore.currentDashboard.components"
          :key="`map-layer-${item.index}-${contentStore.currentDashboard.index}`"
          :config="item"
          mode="halfmap"
          :info-btn="true"
          :toggle-disable="shouldDisable(item.map_config)"
          @info="
            (item) => {
              dialogStore.showMoreInfo(item);
            }
          "
          @toggle="
            (value, map_config) => {
              handleToggle(value, map_config);
            }
          "
          @filter-by-param="
            (map_filter, map_config, x, y) => {
              mapStore.map.filterByParam(map_filter, map_config, x, y);
            }
          "
          @filter-by-layer="
            (map_config, layer) => {
              mapStore.map.filterByLayer(map_config, layer);
            }
          "
          @clear-by-param-filter="
            (map_config) => {
              mapStore.map.clearByParamFilter(map_config);
            }
          "
          @clear-by-layer-filter="
            (map_config) => {
              mapStore.map.clearByLayerFilter(map_config);
            }
          "
        />
      </div>
      <!-- 1.2. If the dashboard is emergences-layer -->
      <div
        v-if="contentStore.currentDashboard.index === 'emergences-layer'"
        class="map-charts"
      >
        <div class="flex-wide">
          <h2>我的位置</h2>
          <button
            v-if="focusedEmergence"
            @click="
              () => {
                focusedEmergence = null;
                mapStore.flyToLocation(locationStore.getLocation());
              }
            "
          >
            x
          </button>
        </div>
        <div class="panel">
          <div class="dashboardcomponent-header">
            <h3>
              <div class="notification-row">
                <div class="flex">
                  <img src="../assets/images/icons/location.svg" />
                  <div>
                    台北市，中正區
                    <h1>中山南路 120 巷</h1>
                  </div>
                </div>
              </div>
            </h3>
            <hr />
            <div class="notification-row">
              <img src="../assets/images/icons/emergence-notify.svg" />
              附近沒有需要注意的災難情報
            </div>
          </div>
        </div>
        <div class="flex-wide">
          <h2>即時災難回報</h2>
          <div class="mute">最後更新: 2024-04-04 12:50</div>
        </div>
        <button
          v-for="(emergence, idx) in emergences"
          v-if="!focusedEmergence"
          class="panel"
          :class="focusedEmergence === emergence ? 'focused' : ''"
          :key="idx"
          @click="
            () => {
              focusedEmergence = emergence;
              mapStore.flyToLocation([emergence.geo.x, emergence.geo.y]);
            }
          "
        >
          <div class="dashboardcomponent-header">
            <div class="flex">
              <img :src="getEmergenceIcon(emergence.type_id)" />
              <div>
                <h2>{{ emergence.name }}</h2>
                {{ emergence.status }} ・
                {{ new Date(emergence.datetime).toLocaleString() }}
              </div>
            </div>
            <hr />
            <div class="notification-row">
              <img src="../assets/images/icons/warning.svg" />
              高風險示警，請立刻了解防災資源
            </div>
          </div>
        </button>
        <button
          v-for="(resource, idx) in emergenceResources"
          v-else
          class="panel"
          :class="focusedEmergenceResource === resource ? 'focused' : ''"
          :key="`resource-${idx}`"
          @click="
            () => {
              focusedEmergenceResource = resource;
              mapStore.flyToLocation([resource.geo.x, resource.geo.y]);
            }
          "
        >
          <div class="dashboardcomponent-header">
            <div class="flex">
              <img :src="getResourceIcon(resource.type)" />
              <div>
                <h2>{{ getResourceName(resource.type) }}</h2>
                {{ resource.name }}
              </div>
            </div>
            <hr />
            <div class="notification-row">
              <img src="../assets/images/icons/target-location.svg" />
              {{ ddToDms(resource.geo.x, "lon") }}, {{ ddToDms(resource.geo.y, "lat") }}
            </div>
          </div>
        </button>
      </div>
      <!-- 2. Dashboards that have components -->
      <div
        v-else-if="
          contentStore.currentDashboard.components?.length !== 0 &&
          contentStore.mapLayers.length > 0
        "
        class="map-charts"
      >
        <DashboardComponent
          v-for="item in parseMapLayers.hasMap"
          :key="`map-layer-${item.index}-${contentStore.currentDashboard.index}`"
          :config="item"
          mode="map"
          :info-btn="true"
          :toggle-disable="shouldDisable(item.map_config)"
          @info="
            (item) => {
              dialogStore.showMoreInfo(item);
            }
          "
          @toggle="
            (value, map_config) => {
              handleToggle(value, map_config);
            }
          "
          @filter-by-param="
            (map_filter, map_config, x, y) => {
              mapStore.map.filterByParam(map_filter, map_config, x, y);
            }
          "
          @filter-by-layer="
            (map_config, layer) => {
              mapStore.map.filterByLayer(map_config, layer);
            }
          "
          @clear-by-param-filter="
            (map_config) => {
              mapStore.map.clearByParamFilter(map_config);
            }
          "
          @clear-by-layer-filter="
            (map_config) => {
              mapStore.map.clearByLayerFilter(map_config);
            }
          "
          @fly="
            (location) => {
              mapStore.map.flyToLocation(location);
            }
          "
        />
        <h2>基本圖層</h2>
        <DashboardComponent
          v-for="item in contentStore.mapLayers"
          :key="`map-layer-${item.index}-${contentStore.currentDashboard.index}`"
          :config="item"
          mode="halfmap"
          :info-btn="true"
          :toggle-disable="shouldDisable(item.map_config)"
          @info="
            (item) => {
              dialogStore.showMoreInfo(item);
            }
          "
          @toggle="
            (value, map_config) => {
              handleToggle(value, map_config);
            }
          "
          @filter-by-param="
            (map_filter, map_config, x, y) => {
              mapStore.map.filterByParam(map_filter, map_config, x, y);
            }
          "
          @filter-by-layer="
            (map_config, layer) => {
              mapStore.map.filterByLayer(map_config, layer);
            }
          "
          @clear-by-param-filter="
            (map_config) => {
              mapStore.map.clearByParamFilter(map_config);
            }
          "
          @clear-by-layer-filter="
            (map_config) => {
              mapStore.map.clearByLayerFilter(map_config);
            }
          "
        />
        <h2 v-if="parseMapLayers.noMap?.length > 0">無空間資料組件</h2>
        <DashboardComponent
          v-for="item in parseMapLayers.noMap"
          :key="`map-layer-${item.index}-${contentStore.currentDashboard.index}`"
          :config="item"
          mode="map"
          :info-btn="true"
          @info="
            (item) => {
              dialogStore.showMoreInfo(item);
            }
          "
          @toggle="handleToggle"
        />
      </div>
      <!-- 3. If dashboard is still loading -->
      <div v-else-if="contentStore.loading" class="map-charts-nodashboard">
        <div />
      </div>
      <!-- 4. If dashboard failed to load -->
      <div v-else-if="contentStore.error" class="map-charts-nodashboard">
        <span>sentiment_very_dissatisfied</span>
        <h2>發生錯誤，無法載入儀表板</h2>
      </div>
      <!-- 5. Dashboards that don't have components -->
      <div v-else class="map-charts-nodashboard">
        <span>addchart</span>
        <h2>尚未加入組件</h2>
        <button
          v-if="contentStore.currentDashboard.icon !== 'favorite'"
          class="hide-if-mobile"
          @click="handleOpenSettings"
        >
          加入您的第一個組件
        </button>
        <p v-else>點擊其他儀表板組件之愛心以新增至收藏組件</p>
      </div>
    </div>
    <MapContainer />
    <MoreInfo />
    <ReportIssue />
  </div>
</template>

<style scoped lang="scss">
.notification-row {
  display: flex;
  align-items: center;
}
.map {
  height: calc(100vh - 127px);
  height: calc(var(--vh) * 100 - 127px);
  display: flex;
  margin: var(--font-m) var(--font-m);

  &-charts {
    width: 360px;
    max-height: 100%;
    height: fit-content;
    display: grid;
    row-gap: var(--font-m);
    margin-right: var(--font-s);
    border-radius: 5px;
    overflow-y: scroll;

    @media (min-width: 1000px) {
      width: 370px;
    }

    @media (min-width: 2000px) {
      width: 400px;
    }

    &-nodashboard {
      width: 360px;
      height: calc(100vh - 127px);
      height: calc(var(--vh) * 100 - 127px);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-right: var(--font-s);

      @media (min-width: 1000px) {
        width: 370px;
      }

      @media (min-width: 2000px) {
        width: 400px;
      }

      span {
        margin-bottom: var(--font-ms);
        font-family: var(--font-icon);
        font-size: 2rem;
      }

      button {
        color: var(--color-highlight);
      }

      div {
        width: 2rem;
        height: 2rem;
        border-radius: 50%;
        border: solid 4px var(--color-border);
        border-top: solid 4px var(--color-highlight);
        animation: spin 0.7s ease-in-out infinite;
      }
    }
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
hr {
  border: 1px solid var(--Color-Neutral-110, #45454a);
  margin-top: 20px;
  margin-bottom: 20px;
}
.flex {
  display: flex;
  gap: 14px;
}
.flex-wide {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.mute {
  font-family: Poppins;
  font-size: 14px;
  font-weight: 400;
  line-height: 20px;
  letter-spacing: -0.01em;
  text-align: left;
  color: #7c7c80;
}
</style>
