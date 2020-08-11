requiredPackages <- c('tidyverse','EpiEstim', 'doParallel', 'foreach')
chooseCRANmirror(ind=1, graphics=FALSE)
install.packages('devtools')
devtools::install_version("cpp11", version = "0.1", repos = "http://cran.us.r-project.org")
for(p in requiredPackages){
  if(!require(p,character.only = TRUE)) install.packages(p)
  library(p,character.only = TRUE)
}
