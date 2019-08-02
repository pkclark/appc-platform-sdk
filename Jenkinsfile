library 'pipeline-library'

def nodeVersion = '10.15.0'
def npmVersion = '6.5.0'

timestamps {
	node('(osx || linux) && git && npm-publish') {
		nodejs(nodeJSInstallationName: "node ${nodeVersion}") {
			ansiColor('xterm') {
				stage ('Checkout') {
					checkout scm

					def npm = sh(returnStdout: true, script: 'npm -v')
					if (!"${npmVersion}".equals(npm)) {
						sh "npm install -g npm@${npmVersion}"
					}

					packageVersion = jsonParse(readFile('package.json'))['version']
					currentBuild.displayName = "#${packageVersion}-${currentBuild.number}"
				} // checkout stage

				// By default, publish any builds on master
				def publish = env.BRANCH_NAME.equals('master')

				stage('Security') {
					sh 'npm install --production'

					sh 'npm audit'

					sh 'npm install retire'
					sh 'node_modules/retire/bin/retire --exitwith 0'
					sh 'npm uninstall retire'
					sh 'npm prune'

					step([$class: 'WarningsPublisher', canComputeNew: false, canResolveRelativePaths: false, consoleParsers: [[parserName: 'Node Security Project Vulnerabilities'], [parserName: 'RetireJS']], defaultEncoding: '', excludePattern: '', healthy: '', includePattern: '', messagesPattern: '', unHealthy: ''])
				} // security stage

				stage ('Lint') {
					sh 'npm install'
					sh 'npm run ci-lint'
				} // lint stage

				stage('Build') {
					decryptFile('development.js.enc', 'test/conf/development.js')
					sh 'npm test'
				} // build stage

				stage('Publish') {
					if (publish) {
						sh 'npm publish'
						pushGitTag(name: packageVersion, message: "See ${env.BUILD_URL} for more information.")
					}
				} // publish stage
			} // ansiColor
		} // nodejs
	} // node
} // timestamps
