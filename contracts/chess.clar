;; Chess Smart Contract
(define-data-var game-counter uint u0)

(define-public (create-game)
  (let ((new-game-id (+ (var-get game-counter) u1)))
    (var-set game-counter new-game-id)
    (ok new-game-id)))
