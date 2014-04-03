describe("The _on_ready private method", function () {

	describe("receives as only argument an object containing the property subs (an array of ids) and", function () {

		it("should call all of the _onReadyCallbacks[id] where id belongs to method", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				subs: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onReadyCallbacks[0] = cb;
			ddp._onReadyCallbacks[1] = cb;
			ddp._onReadyCallbacks[2] = cb;
			ddp._onReadyCallbacks[3] = cb;
			ddp._on_ready(obj);
			cb.callCount.should.equal(4);
		});

		it("it should delete the _onReadyCallbacks[id]-s it calls after calling them", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				subs: ["0", "1", "2", "3"]
			};
			var cb = sinon.spy();
			ddp._onReadyCallbacks[0] = cb;
			ddp._onReadyCallbacks[1] = cb;
			ddp._onReadyCallbacks[2] = cb;
			ddp._onReadyCallbacks[3] = cb;
			ddp._on_ready(obj);
			cb.callCount.should.equal(4);
			_.isUndefined(ddp._onReadyCallbacks[0]).should.be.true;
			_.isUndefined(ddp._onReadyCallbacks[1]).should.be.true;
			_.isUndefined(ddp._onReadyCallbacks[2]).should.be.true;
			_.isUndefined(ddp._onReadyCallbacks[3]).should.be.true;
		});

		it("it should not call _onReadyCallbacks[id] if id belongs to subs but _onReadyCallbacks[id] is undefined", function () {
			var ddp = new DDP(optionsDontAutoconnect);
			var obj = {
				subs: ["0", "1", "2", "3", "4"]
			};
			(function () {
				ddp._on_ready(obj);
			}).should.not.throw();
		});

	});

});
