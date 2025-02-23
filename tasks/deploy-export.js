task("deploy-and-export", "Deploys contracts and exports artifacts")
	.addPositionalParam("modulePath", "Path to the ignition module")
	.setAction(async (taskArgs, hre) => {
		try {
			// Run the deployment with the provided module path
			const module = require(taskArgs.modulePath);
			await hre.ignition.deploy(module);

			// After successful deployment, run the export script
			const { exportArtifacts } = require("../scripts/exportArtifacts.js");

			// Export for both networks
			if (
				hre.network.name === "hardhat" ||
				hre.network.name === "localhost"
			) {
				exportArtifacts(31337);
			} else if (hre.network.name === "sepolia") {
				exportArtifacts(11155111);
			}

			console.log(
				"Deployment and artifact export completed successfully"
			);
		} catch (error) {
			console.error("Deployment or export failed:", error);
			process.exit(1);
		}
	});