import { React, type AllWidgetProps } from "jimu-core";
import { JimuMapViewComponent, type JimuMapView } from "jimu-arcgis";
import FeatureLayer from "esri/layers/FeatureLayer";
import Query from "esri/rest/support/Query";
const { useState } = React;

const Widget = (props: AllWidgetProps<any>) => {
	const [jimuMapView, setJimuMapView] = useState<JimuMapView>();
	const [selectedFeature, setSelectedFeature] = useState(null);

	const activeViewChangeHandler = (jmv: JimuMapView) => {
		if (jmv) {
			setJimuMapView(jmv);
		}
	};

	const handleFeatureClick = async (event, layer) => {
		if (event.graphic && event.graphic.attributes) {
			const fid = event.graphic.attributes.FID;

			if (fid !== undefined) {
				const query = new Query({
					where: `FID = ${fid}`,
					outFields: ["*"], // Request all fields
					returnGeometry: false,
				});

				try {
					// Here, we're calling queryFeatures on the layer object
					const results = await layer.queryFeatures(query);
					if (results.features.length > 0) {
						setSelectedFeature(results.features[0].attributes);
						console.log(results.features[0].attributes);
					}
				} catch (error) {
					console.error("Error querying feature:", error);
				}
			} else {
				setSelectedFeature(event.graphic.attributes);
				console.log(event.graphic.attributes);
			}
		}
	};

	const formSubmit = (evt) => {
		evt.preventDefault();

		const layer = new FeatureLayer({
			url: "https://services3.arcgis.com/GVgbJbqm8hXASVYi/arcgis/rest/services/Trailheads_Styled/FeatureServer/0",
		});

		jimuMapView.view.map.add(layer);

		jimuMapView.view.on("click", (event) => {
			jimuMapView.view.hitTest(event).then((response) => {
				console.log(response);
				const feature = response.results.find(
					(result) => result.graphic.layer === layer
				);
				if (feature) {
					handleFeatureClick(feature, layer);
				}
			});
		});
	};

	return (
		<div className="widget-starter jimu-widget">
			{props.useMapWidgetIds && props.useMapWidgetIds.length === 1 && (
				<JimuMapViewComponent
					useMapWidgetId={props.useMapWidgetIds?.[0]}
					onActiveViewChange={activeViewChangeHandler}
				/>
			)}
			<form onSubmit={formSubmit}>
				<div>
					<button>Add Layer</button>
				</div>
			</form>
			<p>
				<strong>Selected Feature: {selectedFeature?.CITY_JUR}</strong>
			</p>
		</div>
	);
};

export default Widget;
