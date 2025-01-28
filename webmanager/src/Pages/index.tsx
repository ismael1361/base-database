import React from "react";
import { Spreadsheet } from "./Spreadsheet";
import { Navigator } from "Components";

export const Main: React.FC = () => {
	return (
		<>
			<Navigator>
				<Navigator.Page
					name="data_base"
					title="Base de Dados"
				>
					<Spreadsheet />
				</Navigator.Page>
				<Navigator.Page
					name="script"
					title="Script"
				/>
			</Navigator>
		</>
	);
};
