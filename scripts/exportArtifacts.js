const fs = require("fs");
const path = require("path");

function exportArtifacts(chainId) {
	console.log("Exporting artifacts for chainId:", chainId);

	const addressSourceDir = path.join(
		__dirname,
		`../ignition/deployments/chain-${chainId}`,
		"deployed_addresses.json"
	);
	const abiSourceDir = path.join(
		__dirname,
		`../ignition/deployments/chain-${chainId}/artifacts`,
		"FundMeModule#FundMe.json"
	);

	/*const targetDir = path.join(
		__dirname,
		"../../../HTML-fund-md-revision/artifacts"
	);*/
	const targetDir = path.join(
		__dirname,
		"../../Html-fund-me/artifacts"
	);
	try {
		if (!fs.existsSync(targetDir)) {
			// Create the directory if it does not exist
			fs.mkdirSync(targetDir, { recursive: true });
		}

		if (fs.existsSync(addressSourceDir)) {
			fs.copyFileSync(
				addressSourceDir,
				path.join(targetDir, "deployed_addresses.json")
			);
			console.log("Successfully exported deployed_addresses.json");
		} else {
			console.log(`${addressSourceDir} does not exist`);
		}
		if (fs.existsSync(abiSourceDir)) {
			fs.copyFileSync(
				abiSourceDir,
				path.join(targetDir, "FundMeArtifact.json")
			);
			console.log("Successfully exported FundMeArtifact.json");
		} else {
			console.log(`${abiSourceDir} does not exist`);
		}
	} catch(error) {
		console.error("Error copying files:", error);
	}
}

async function main() {
	exportArtifacts(31337);
	// exportArtifacts(11155111);
}

if (require.main === module) {
	// Only run if script is run directly
	main()
		.then(() => process.exit(0))
		.catch((error) => {
			console.error(error);
			process.exit(1);
		});
}
module.exports = { exportArtifacts };
