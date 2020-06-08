requiredPackages <- c('tidyverse','EpiEstim', 'doParallel', 'foreach')
chooseCRANmirror(ind=1, graphics=FALSE)
for(p in requiredPackages){
  if(!require(p,character.only = TRUE)) install.packages(p)
  library(p,character.only = TRUE)
}
