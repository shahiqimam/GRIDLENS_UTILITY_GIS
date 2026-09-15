pipeline {
  agent any

  stages {
    stage('Install') {
      steps {
        sh 'corepack enable'
        sh 'pnpm install --frozen-lockfile'
      }
    }

    stage('Verify') {
      steps {
        sh 'pnpm lint'
        sh 'pnpm typecheck'
        sh 'pnpm test'
        sh 'pnpm build'
      }
    }
  }
}
